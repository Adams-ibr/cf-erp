import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Folder, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateFolderDto, UpdateFolderDto, FolderQueryDto, FolderResponseDto } from './dto/folder.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class FoldersService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<FolderResponseDto> {
    const existingFolder = await this.prisma.folder.findUnique({
      where: { code_tenantId: { code: createFolderDto.code, tenantId } },
    });

    if (existingFolder) {
      throw new ConflictException('Folder code already exists in this tenant');
    }

    let path = createFolderDto.code;
    if (createFolderDto.parentId) {
      const parent = await this.prisma.folder.findFirst({
        where: { id: createFolderDto.parentId, tenantId, isDeleted: false },
      });
      if (!parent) {
        throw new NotFoundException('Parent folder not found');
      }
      path = `${parent.path}/${createFolderDto.code}`;
    }

    const folder = await this.prisma.folder.create({
      data: {
        code: createFolderDto.code,
        name: createFolderDto.name,
        description: createFolderDto.description,
        parentId: createFolderDto.parentId,
        path,
        color: createFolderDto.color,
        icon: createFolderDto.icon,
        sortOrder: createFolderDto.sortOrder || 0,
        tenantId,
        branchId,
        createdBy: userId,
      },
    });

    await this.publishEvent('folder.created', folder);

    return this.mapToResponse(folder);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: FolderQueryDto,
  ): Promise<PaginatedResult<FolderResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.FolderWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.parentId) {
      where.parentId = query.parentId;
    } else {
      where.parentId = null;
    }

    if (query.isSystem !== undefined) {
      where.isSystem = query.isSystem;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { sortOrder: 'asc', name: 'asc' };

    const [folders, total] = await Promise.all([
      this.prisma.folder.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: { select: { documents: true, children: true } },
        },
      }),
      this.prisma.folder.count({ where }),
    ]);

    return {
      data: folders.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTree(tenantId: string): Promise<FolderResponseDto[]> {
    const rootFolders = await this.prisma.folder.findMany({
      where: { tenantId, isDeleted: false, parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isDeleted: false },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              where: { isDeleted: false },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    return rootFolders.map(this.mapToResponse);
  }

  async findById(tenantId: string, id: string): Promise<FolderResponseDto> {
    const folder = await this.prisma.folder.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        parent: true,
        children: { where: { isDeleted: false }, orderBy: { sortOrder: 'asc' } },
        _count: { select: { documents: true } },
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return this.mapToResponse(folder);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateFolderDto: UpdateFolderDto,
  ): Promise<FolderResponseDto> {
    const folder = await this.findById(tenantId, id);

    if (folder.isSystem) {
      throw new BadRequestException('Cannot update system folder');
    }

    let path = folder.path;
    if (updateFolderDto.parentId && updateFolderDto.parentId !== folder.parentId) {
      if (updateFolderDto.parentId === id) {
        throw new BadRequestException('Folder cannot be its own parent');
      }

      const parent = await this.prisma.folder.findFirst({
        where: { id: updateFolderDto.parentId, tenantId, isDeleted: false },
      });
      if (!parent) {
        throw new NotFoundException('Parent folder not found');
      }

      path = `${parent.path}/${folder.code}`;
    }

    const updatedFolder = await this.prisma.folder.update({
      where: { id },
      data: {
        ...updateFolderDto,
        path,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        parent: true,
        children: { where: { isDeleted: false }, orderBy: { sortOrder: 'asc' } },
      },
    });

    if (updateFolderDto.parentId && updateFolderDto.parentId !== folder.parentId) {
      await this.updateChildrenPaths(tenantId, id, path);
    }

    await this.publishEvent('folder.updated', updatedFolder);

    return this.mapToResponse(updatedFolder);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const folder = await this.findById(tenantId, id);

    if (folder.isSystem) {
      throw new BadRequestException('Cannot delete system folder');
    }

    const hasDocuments = await this.prisma.document.count({
      where: { folderId: id, isDeleted: false },
    });

    if (hasDocuments > 0) {
      throw new BadRequestException('Cannot delete folder with documents');
    }

    const hasChildren = await this.prisma.folder.count({
      where: { parentId: id, isDeleted: false },
    });

    if (hasChildren > 0) {
      throw new BadRequestException('Cannot delete folder with subfolders');
    }

    await this.prisma.folder.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('folder.deleted', { id, tenantId });
  }

  async addAccessRule(
    tenantId: string,
    folderId: string,
    userId: string,
    body: { principalType: string; principalId: string; permission: string; expiresAt?: Date; inherits?: boolean; conditions?: Record<string, unknown> },
  ): Promise<any> {
    const folder = await this.findById(tenantId, folderId);

    const existingRule = await this.prisma.folderAccessRule.findUnique({
      where: {
        folderId_principalType_principalId_permission: {
          folderId,
          principalType: body.principalType as any,
          principalId: body.principalId,
          permission: body.permission as any,
        },
      },
    });

    if (existingRule) {
      throw new ConflictException('Access rule already exists');
    }

    const rule = await this.prisma.folderAccessRule.create({
      data: {
        folderId,
        principalType: body.principalType as any,
        principalId: body.principalId,
        permission: body.permission as any,
        grantedBy: userId,
        expiresAt: body.expiresAt,
        inherits: body.inherits ?? true,
        conditions: body.conditions,
        tenantId,
      },
    });

    return rule;
  }

  async removeAccessRule(tenantId: string, folderId: string, ruleId: string, userId: string): Promise<void> {
    await this.findById(tenantId, folderId);

    const rule = await this.prisma.folderAccessRule.findFirst({
      where: { id: ruleId, folderId },
    });

    if (!rule) {
      throw new NotFoundException('Access rule not found');
    }

    await this.prisma.folderAccessRule.delete({ where: { id: ruleId } });
  }

  private async updateChildrenPaths(tenantId: string, parentId: string, newParentPath: string): Promise<void> {
    const children = await this.prisma.folder.findMany({
      where: { parentId, tenantId, isDeleted: false },
    });

    for (const child of children) {
      const newPath = `${newParentPath}/${child.code}`;
      await this.prisma.folder.update({
        where: { id: child.id },
        data: { path: newPath },
      });
      await this.updateChildrenPaths(tenantId, child.id, newPath);
    }
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'FOLDER',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish folder event:', error);
    }
  }

  private mapToResponse(folder: Folder & { parent?: any; children?: any[]; _count?: any }): FolderResponseDto {
    return {
      id: folder.id,
      code: folder.code,
      name: folder.name,
      description: folder.description,
      parentId: folder.parentId,
      path: folder.path,
      color: folder.color,
      icon: folder.icon,
      isSystem: folder.isSystem,
      sortOrder: folder.sortOrder,
      children: folder.children?.map(this.mapToResponse),
      documentCount: folder._count?.documents,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    };
  }
}