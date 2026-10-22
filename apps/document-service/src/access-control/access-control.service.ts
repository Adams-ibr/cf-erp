import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, DocumentAccessRule, FolderAccessRule, DocumentShare, AccessPrincipalType, AccessPermission, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateAccessRuleDto, AccessRuleQueryDto, AccessRuleResponseDto, CreateShareDto, ShareResponseDto } from './dto/access-control.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';
import * as crypto from 'crypto';

@Injectable()
export class AccessControlService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async addDocumentRule(
    tenantId: string,
    documentId: string,
    userId: string,
    createAccessRuleDto: CreateAccessRuleDto,
  ): Promise<AccessRuleResponseDto> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId, isDeleted: false },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const existingRule = await this.prisma.documentAccessRule.findUnique({
      where: {
        documentId_principalType_principalId_permission: {
          documentId,
          principalType: createAccessRuleDto.principalType,
          principalId: createAccessRuleDto.principalId,
          permission: createAccessRuleDto.permission,
        },
      },
    });

    if (existingRule) {
      throw new ConflictException('Access rule already exists');
    }

    const rule = await this.prisma.documentAccessRule.create({
      data: {
        documentId,
        principalType: createAccessRuleDto.principalType,
        principalId: createAccessRuleDto.principalId,
        permission: createAccessRuleDto.permission,
        grantedBy: userId,
        expiresAt: createAccessRuleDto.expiresAt,
        conditions: createAccessRuleDto.conditions,
        tenantId,
      },
    });

    return this.mapDocumentRuleToResponse(rule);
  }

  async getDocumentRules(
    tenantId: string,
    documentId: string,
    query: AccessRuleQueryDto,
  ): Promise<PaginatedResult<AccessRuleResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentAccessRuleWhereInput = {
      documentId,
    };

    if (query.principalType) {
      where.principalType = query.principalType;
    }

    if (query.principalId) {
      where.principalId = query.principalId;
    }

    if (query.permission) {
      where.permission = query.permission;
    }

    const orderBy = { grantedAt: 'desc' };

    const [rules, total] = await Promise.all([
      this.prisma.documentAccessRule.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.documentAccessRule.count({ where }),
    ]);

    return {
      data: rules.map(this.mapDocumentRuleToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async removeDocumentRule(tenantId: string, documentId: string, ruleId: string, userId: string): Promise<void> {
    const rule = await this.prisma.documentAccessRule.findFirst({
      where: { id: ruleId, documentId },
    });

    if (!rule) {
      throw new NotFoundException('Access rule not found');
    }

    await this.prisma.documentAccessRule.delete({ where: { id: ruleId } });
  }

  async addFolderRule(
    tenantId: string,
    folderId: string,
    userId: string,
    createAccessRuleDto: CreateAccessRuleDto,
  ): Promise<AccessRuleResponseDto> {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, tenantId, isDeleted: false },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const existingRule = await this.prisma.folderAccessRule.findUnique({
      where: {
        folderId_principalType_principalId_permission: {
          folderId,
          principalType: createAccessRuleDto.principalType,
          principalId: createAccessRuleDto.principalId,
          permission: createAccessRuleDto.permission,
        },
      },
    });

    if (existingRule) {
      throw new ConflictException('Access rule already exists');
    }

    const rule = await this.prisma.folderAccessRule.create({
      data: {
        folderId,
        principalType: createAccessRuleDto.principalType,
        principalId: createAccessRuleDto.principalId,
        permission: createAccessRuleDto.permission,
        grantedBy: userId,
        expiresAt: createAccessRuleDto.expiresAt,
        inherits: createAccessRuleDto.inherits ?? true,
        conditions: createAccessRuleDto.conditions,
        tenantId,
      },
    });

    return this.mapFolderRuleToResponse(rule);
  }

  async getFolderRules(
    tenantId: string,
    folderId: string,
    query: AccessRuleQueryDto,
  ): Promise<PaginatedResult<AccessRuleResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.FolderAccessRuleWhereInput = {
      folderId,
    };

    if (query.principalType) {
      where.principalType = query.principalType;
    }

    if (query.principalId) {
      where.principalId = query.principalId;
    }

    if (query.permission) {
      where.permission = query.permission;
    }

    const orderBy = { grantedAt: 'desc' };

    const [rules, total] = await Promise.all([
      this.prisma.folderAccessRule.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.folderAccessRule.count({ where }),
    ]);

    return {
      data: rules.map(this.mapFolderRuleToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async removeFolderRule(tenantId: string, folderId: string, ruleId: string, userId: string): Promise<void> {
    const rule = await this.prisma.folderAccessRule.findFirst({
      where: { id: ruleId, folderId },
    });

    if (!rule) {
      throw new NotFoundException('Access rule not found');
    }

    await this.prisma.folderAccessRule.delete({ where: { id: ruleId } });
  }

  async shareDocument(
    tenantId: string,
    documentId: string,
    userId: string,
    createShareDto: CreateShareDto,
  ): Promise<ShareResponseDto> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId, isDeleted: false },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const token = crypto.randomBytes(32).toString('hex');

    const share = await this.prisma.documentShare.create({
      data: {
        documentId,
        sharedBy: userId,
        sharedWith: createShareDto.sharedWith,
        permission: createShareDto.permission,
        message: createShareDto.message,
        expiresAt: createShareDto.expiresAt,
        token,
        isActive: true,
        tenantId,
      },
    });

    return this.mapShareToResponse(share);
  }

  async getDocumentShares(tenantId: string, documentId: string): Promise<ShareResponseDto[]> {
    const shares = await this.prisma.documentShare.findMany({
      where: { documentId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return shares.map(this.mapShareToResponse);
  }

  async revokeShare(tenantId: string, documentId: string, shareId: string, userId: string): Promise<void> {
    const share = await this.prisma.documentShare.findFirst({
      where: { id: shareId, documentId },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.sharedBy !== userId) {
      throw new ForbiddenException('Only the sharer can revoke the share');
    }

    await this.prisma.documentShare.update({
      where: { id: shareId },
      data: { isActive: false },
    });
  }

  async accessSharedDocument(token: string): Promise<{ documentId: string; permission: string; document?: any }> {
    const share = await this.prisma.documentShare.findFirst({
      where: { token, isActive: true },
    });

    if (!share) {
      throw new NotFoundException('Invalid or expired share token');
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      throw new BadRequestException('Share link has expired');
    }

    await this.prisma.documentShare.update({
      where: { id: share.id },
      data: {
        accessedAt: new Date(),
        accessCount: { increment: 1 },
      },
    });

    const document = await this.prisma.document.findFirst({
      where: { id: share.documentId, isDeleted: false },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return {
      documentId: share.documentId,
      permission: share.permission,
      document,
    };
  }

  async checkDocumentAccess(
    tenantId: string,
    documentId: string,
    userId: string,
    requiredPermission: AccessPermission,
  ): Promise<boolean> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId, isDeleted: false },
      include: {
        accessRules: true,
        shares: { where: { isActive: true } },
        folder: { include: { accessRules: true } },
      },
    });

    if (!document) {
      return false;
    }

    // Check direct access rules
    for (const rule of document.accessRules) {
      if (this.matchesPrincipal(rule, userId) && this.hasPermission(rule.permission, requiredPermission)) {
        if (!rule.expiresAt || rule.expiresAt > new Date()) {
          return true;
        }
      }
    }

    // Check shares
    for (const share of document.shares) {
      if (share.sharedWith === userId && share.isActive) {
        if (!share.expiresAt || share.expiresAt > new Date()) {
          if (this.hasPermission(share.permission, requiredPermission)) {
            return true;
          }
        }
      }
    }

    // Check folder access rules (inherited)
    if (document.folder) {
      let currentFolder: any = document.folder;
      while (currentFolder) {
        for (const rule of currentFolder.accessRules) {
          if (rule.inherits && this.matchesPrincipal(rule, userId) && this.hasPermission(rule.permission, requiredPermission)) {
            if (!rule.expiresAt || rule.expiresAt > new Date()) {
              return true;
            }
          }
        }
        if (currentFolder.parentId) {
          currentFolder = await this.prisma.folder.findUnique({ where: { id: currentFolder.parentId }, include: { accessRules: true } });
        } else {
          break;
        }
      }
    }

    return false;
  }

  private matchesPrincipal(rule: { principalType: AccessPrincipalType; principalId: string }, userId: string): boolean {
    switch (rule.principalType) {
      case AccessPrincipalType.USER:
        return rule.principalId === userId;
      case AccessPrincipalType.ROLE:
      case AccessPrincipalType.GROUP:
      case AccessPrincipalType.DEPARTMENT:
        // Would need to check user's roles/groups/departments
        return false; // Simplified
      case AccessPrincipalType.TENANT:
        return true;
      default:
        return false;
    }
  }

  private hasPermission(granted: AccessPermission, required: AccessPermission): boolean {
    const permissionHierarchy: Record<AccessPermission, AccessPermission[]> = {
      READ: [AccessPermission.READ],
      WRITE: [AccessPermission.READ, AccessPermission.WRITE],
      DELETE: [AccessPermission.READ, AccessPermission.WRITE, AccessPermission.DELETE],
      SHARE: [AccessPermission.READ, AccessPermission.SHARE],
      ADMIN: [AccessPermission.READ, AccessPermission.WRITE, AccessPermission.DELETE, AccessPermission.SHARE, AccessPermission.ADMIN],
      VERSION_CONTROL: [AccessPermission.READ, AccessPermission.WRITE, AccessPermission.VERSION_CONTROL],
    };
    return permissionHierarchy[granted]?.includes(required) || false;
  }

  private mapDocumentRuleToResponse(rule: DocumentAccessRule): AccessRuleResponseDto {
    return {
      id: rule.id,
      documentId: rule.documentId,
      folderId: '',
      principalType: rule.principalType,
      principalId: rule.principalId,
      permission: rule.permission,
      grantedBy: rule.grantedBy,
      grantedAt: rule.grantedAt,
      expiresAt: rule.expiresAt,
      inherits: true,
      conditions: rule.conditions as Record<string, unknown> | undefined,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }

  private mapFolderRuleToResponse(rule: FolderAccessRule): AccessRuleResponseDto {
    return {
      id: rule.id,
      documentId: '',
      folderId: rule.folderId,
      principalType: rule.principalType,
      principalId: rule.principalId,
      permission: rule.permission,
      grantedBy: rule.grantedBy,
      grantedAt: rule.grantedAt,
      expiresAt: rule.expiresAt,
      inherits: rule.inherits,
      conditions: rule.conditions as Record<string, unknown> | undefined,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }

  private mapShareToResponse(share: DocumentShare): ShareResponseDto {
    return {
      id: share.id,
      documentId: share.documentId,
      sharedBy: share.sharedBy,
      sharedWith: share.sharedWith,
      permission: share.permission,
      message: share.message,
      expiresAt: share.expiresAt,
      accessedAt: share.accessedAt,
      accessCount: share.accessCount,
      token: share.token,
      isActive: share.isActive,
      createdAt: share.createdAt,
      updatedAt: share.updatedAt,
    };
  }
}