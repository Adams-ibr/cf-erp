import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, Role, Permission, RolePermission } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionDto, RoleQueryDto, RoleResponseDto, PermissionResponseDto } from './dto/role.dto';
import { PaginatedResult } from '@cf-erp/shared';

@Injectable()
export class RolesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(tenantId: string, createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const existingRole = await this.prisma.role.findUnique({
      where: { code_tenantId: { code: createRoleDto.code, tenantId } },
    });

    if (existingRole) {
      throw new ConflictException('Role code already exists in this tenant');
    }

    const role = await this.prisma.role.create({
      data: {
        code: createRoleDto.code,
        name: createRoleDto.name,
        description: createRoleDto.description,
        tenantId,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      await this.assignPermissions(tenantId, role.id, createRoleDto.permissionIds);
    }

    return this.mapToResponse(role);
  }

  async findAll(tenantId: string, query: RoleQueryDto): Promise<PaginatedResult<RoleResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      isDeleted: false,
    };

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
      : { createdAt: 'desc' };

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      data: roles.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.mapToResponse(role);
  }

  async update(tenantId: string, id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    await this.findById(tenantId, id);

    const updateData: any = {
      ...updateRoleDto,
      updatedAt: new Date(),
    };

    if (updateRoleDto.permissionIds !== undefined) {
      await this.syncPermissions(tenantId, id, updateRoleDto.permissionIds);
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return this.mapToResponse(updatedRole);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const role = await this.findById(tenantId, id);

    if (role.isSystem) {
      throw new ConflictException('Cannot delete system role');
    }

    await this.prisma.role.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async assignPermission(tenantId: string, roleId: string, assignPermissionDto: AssignPermissionDto): Promise<RolePermission> {
    const role = await this.findById(tenantId, roleId);

    const permission = await this.prisma.permission.findFirst({
      where: { id: assignPermissionDto.permissionId, OR: [{ tenantId }, { tenantId: null }] },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const existingRolePermission = await this.prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId, permissionId: assignPermissionDto.permissionId } },
    });

    if (existingRolePermission) {
      throw new ConflictException('Role already has this permission');
    }

    return this.prisma.rolePermission.create({
      data: { roleId, permissionId: assignPermissionDto.permissionId },
    });
  }

  async removePermission(tenantId: string, roleId: string, permissionId: string): Promise<void> {
    await this.findById(tenantId, roleId);

    const rolePermission = await this.prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId, permissionId } },
    });

    if (!rolePermission) {
      throw new NotFoundException('Role permission not found');
    }

    await this.prisma.rolePermission.delete({
      where: { id: rolePermission.id },
    });
  }

  async getPermissions(tenantId: string, roleId: string): Promise<PermissionResponseDto[]> {
    const role = await this.findById(tenantId, roleId);
    return role.permissions.map(this.mapPermissionToResponse);
  }

  async getAllPermissions(tenantId: string): Promise<PermissionResponseDto[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        OR: [{ tenantId }, { tenantId: null }],
      },
      orderBy: { resource: 'asc' },
    });

    return permissions.map(this.mapPermissionToResponse);
  }

  private async assignPermissions(tenantId: string, roleId: string, permissionIds: string[]): Promise<void> {
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds }, OR: [{ tenantId }, { tenantId: null }] },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    await this.prisma.rolePermission.createMany({
      data: permissionIds.map(permissionId => ({ roleId, permissionId })),
      skipDuplicates: true,
    });
  }

  private async syncPermissions(tenantId: string, roleId: string, permissionIds: string[]): Promise<void> {
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    if (permissionIds.length > 0) {
      await this.assignPermissions(tenantId, roleId, permissionIds);
    }
  }

  private mapToResponse(role: Role & { permissions: Array<{ permission: Permission }> }): RoleResponseDto {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.permissions.map(rp => this.mapPermissionToResponse(rp.permission)),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  private mapPermissionToResponse(permission: Permission): PermissionResponseDto {
    return {
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      isSystem: permission.isSystem,
    };
  }
}