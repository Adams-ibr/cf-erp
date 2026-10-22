import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Document, DocumentVersion, DocumentStatus, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateVersionDto, VersionQueryDto, VersionResponseDto } from './dto/version.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VersionsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    documentId: string,
    userId: string,
    createVersionDto: CreateVersionDto,
  ): Promise<VersionResponseDto> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId, isDeleted: false },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.status === DocumentStatus.ARCHIVED || document.status === DocumentStatus.EXPIRED) {
      throw new BadRequestException('Cannot create version for archived or expired document');
    }

    const latestVersion = await this.prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    const version = await this.prisma.$transaction(async (tx) => {
      const newVersionRecord = await tx.documentVersion.create({
        data: {
          documentId,
          version: newVersion,
          name: document.name,
          description: document.description,
          mimeType: createVersionDto.mimeType,
          size: BigInt(createVersionDto.size),
          checksum: createVersionDto.checksum,
          storagePath: createVersionDto.storagePath,
          storageUrl: createVersionDto.storageUrl,
          changelog: createVersionDto.changelog,
          uploadedBy: userId,
        },
      });

      await tx.document.update({
        where: { id: documentId },
        data: {
          version: newVersion,
          mimeType: createVersionDto.mimeType,
          size: BigInt(createVersionDto.size),
          checksum: createVersionDto.checksum,
          storagePath: createVersionDto.storagePath,
          storageUrl: createVersionDto.storageUrl,
          isLatest: true,
          previousVersionId: latestVersion?.id,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      });

      if (latestVersion) {
        await tx.documentVersion.update({
          where: { id: latestVersion.id },
          data: { isLatest: false },
        });
      }

      return newVersionRecord;
    });

    await this.publishEvent('document.version_created', {
      ...version,
      documentId,
      documentCode: document.code,
    });

    return this.mapToResponse(version);
  }

  async findAll(
    tenantId: string,
    documentId: string,
    query: VersionQueryDto,
  ): Promise<PaginatedResult<VersionResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentVersionWhereInput = {
      documentId,
    };

    if (query.version) {
      where.version = query.version;
    }

    const orderBy = { version: 'desc' };

    const [versions, total] = await Promise.all([
      this.prisma.documentVersion.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.documentVersion.count({ where }),
    ]);

    return {
      data: versions.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, documentId: string, id: string): Promise<VersionResponseDto> {
    const version = await this.prisma.documentVersion.findFirst({
      where: { id, documentId },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    return this.mapToResponse(version);
  }

  async restore(
    tenantId: string,
    documentId: string,
    versionId: string,
    userId: string,
  ): Promise<Document> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId, isDeleted: false },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const version = await this.prisma.documentVersion.findFirst({
      where: { id: versionId, documentId },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    if (document.version === version.version) {
      throw new BadRequestException('Document is already at this version');
    }

    const restoredDocument = await this.prisma.$transaction(async (tx) => {
      const latestVersion = await tx.documentVersion.findFirst({
        where: { documentId },
        orderBy: { version: 'desc' },
      });

      const newVersion = (latestVersion?.version || 0) + 1;

      await tx.documentVersion.create({
        data: {
          documentId,
          version: newVersion,
          name: version.name,
          description: version.description,
          mimeType: version.mimeType,
          size: version.size,
          checksum: version.checksum,
          storagePath: version.storagePath,
          storageUrl: version.storageUrl,
          changelog: `Restored to version ${version.version}`,
          uploadedBy: userId,
        },
      });

      if (latestVersion) {
        await tx.documentVersion.update({
          where: { id: latestVersion.id },
          data: { isLatest: false },
        });
      }

      return tx.document.update({
        where: { id: documentId },
        data: {
          version: newVersion,
          name: version.name,
          description: version.description,
          mimeType: version.mimeType,
          size: version.size,
          checksum: version.checksum,
          storagePath: version.storagePath,
          storageUrl: version.storageUrl,
          isLatest: true,
          previousVersionId: latestVersion?.id,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      });
    });

    await this.publishEvent('document.version_restored', {
      documentId,
      restoredToVersion: version.version,
      newVersion: restoredDocument.version,
    });

    return restoredDocument;
  }

  async download(
    tenantId: string,
    documentId: string,
    versionId: string,
    res: any,
  ): Promise<void> {
    const version = await this.findById(tenantId, documentId, versionId);

    if (fs.existsSync(version.storagePath)) {
      res.setHeader('Content-Type', version.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${version.name}-v${version.version}${path.extname(version.storagePath)}"`);
      const stream = fs.createReadStream(version.storagePath);
      stream.pipe(res);
    } else if (version.storageUrl) {
      return res.redirect(version.storageUrl);
    } else {
      throw new NotFoundException('File not available for download');
    }
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'DOCUMENT_VERSION',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.uploadedBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish document version event:', error);
    }
  }

  private mapToResponse(version: DocumentVersion): VersionResponseDto {
    return {
      id: version.id,
      documentId: version.documentId,
      version: version.version,
      name: version.name,
      description: version.description,
      mimeType: version.mimeType,
      size: Number(version.size),
      checksum: version.checksum,
      storagePath: version.storagePath,
      storageUrl: version.storageUrl,
      changelog: version.changelog,
      uploadedBy: version.uploadedBy,
      createdAt: version.createdAt,
    };
  }
}