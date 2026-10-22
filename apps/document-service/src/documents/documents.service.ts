import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Document, DocumentStatus, DocumentType, Classification, AccessLevel, RetentionPolicy, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateDocumentDto, UpdateDocumentDto, DocumentQueryDto, DocumentResponseDto, MoveDocumentDto, CopyDocumentDto } from './dto/document.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';

  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createDocumentDto: CreateDocumentDto,
  ): Promise<DocumentResponseDto> {
    const existingDoc = await this.prisma.document.findUnique({
      where: { code_tenantId: { code: createDocumentDto.code, tenantId } },
    });

    if (existingDoc) {
      throw new ConflictException('Document code already exists in this tenant');
    }

    if (createDocumentDto.folderId) {
      const folder = await this.prisma.folder.findFirst({
        where: { id: createDocumentDto.folderId, tenantId, isDeleted: false },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
    }

    if (createDocumentDto.templateId) {
      const template = await this.prisma.template.findFirst({
        where: { id: createDocumentDto.templateId, tenantId, isDeleted: false },
      });
      if (!template) {
        throw new NotFoundException('Template not found');
      }
    }

    const document = await this.prisma.document.create({
      data: {
        code: createDocumentDto.code,
        name: createDocumentDto.name,
        description: createDocumentDto.description,
        type: createDocumentDto.type,
        category: createDocumentDto.category,
        status: DocumentStatus.DRAFT,
        mimeType: createDocumentDto.mimeType,
        size: BigInt(createDocumentDto.size),
        checksum: createDocumentDto.checksum,
        storageProvider: createDocumentDto.storageProvider || 'local',
        storagePath: createDocumentDto.storagePath,
        storageUrl: createDocumentDto.storageUrl,
        tags: createDocumentDto.tags || [],
        metadata: createDocumentDto.metadata,
        retentionPolicy: createDocumentDto.retentionPolicy,
        retentionDate: createDocumentDto.retentionDate,
        classification: createDocumentDto.classification || Classification.INTERNAL,
        accessLevel: createDocumentDto.accessLevel || AccessLevel.PRIVATE,
        folderId: createDocumentDto.folderId,
        templateId: createDocumentDto.templateId,
        tenantId,
        branchId,
        uploadedBy: userId,
      },
    });

    await this.publishEvent('document.created', document);

    return this.mapToResponse(document);
  }

  async upload(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
  ): Promise<DocumentResponseDto> {
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    const existingDoc = await this.prisma.document.findUnique({
      where: { code_tenantId: { code: createDocumentDto.code, tenantId } },
    });

    if (existingDoc) {
      throw new ConflictException('Document code already exists in this tenant');
    }

    const fileName = `${createDocumentDto.code}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, tenantId, fileName);
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, file.buffer);

    const document = await this.prisma.document.create({
      data: {
        code: createDocumentDto.code,
        name: createDocumentDto.name,
        description: createDocumentDto.description,
        type: createDocumentDto.type,
        category: createDocumentDto.category,
        status: DocumentStatus.ACTIVE,
        mimeType: file.mimetype,
        size: BigInt(file.size),
        checksum,
        storageProvider: 'local',
        storagePath: filePath,
        storageUrl: `/api/v1/documents/${createDocumentDto.code}/download`,
        tags: createDocumentDto.tags || [],
        metadata: createDocumentDto.metadata,
        classification: createDocumentDto.classification || Classification.INTERNAL,
        accessLevel: createDocumentDto.accessLevel || AccessLevel.PRIVATE,
        folderId: createDocumentDto.folderId,
        templateId: createDocumentDto.templateId,
        tenantId,
        branchId,
        uploadedBy: userId,
      },
    });

    await this.publishEvent('document.uploaded', document);

    return this.mapToResponse(document);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: DocumentQueryDto,
  ): Promise<PaginatedResult<DocumentResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.status) {
      where.status = query.status as DocumentStatus;
    }

    if (query.type) {
      where.type = query.type as DocumentType;
    }

    if (query.classification) {
      where.classification = query.classification as Classification;
    }

    if (query.folderId) {
      where.folderId = query.folderId;
    }

    if (query.templateId) {
      where.templateId = query.templateId;
    }

    if (query.uploadedBy) {
      where.uploadedBy = query.uploadedBy;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          folder: true,
          template: true,
          _count: { select: { versions: true, accessRules: true, shares: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<DocumentResponseDto> {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        folder: true,
        template: true,
        versions: { orderBy: { version: 'desc' }, take: 10 },
        accessRules: true,
        shares: { where: { isActive: true } },
        ocrResults: { orderBy: { createdAt: 'desc' }, take: 1 },
        classifications: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.mapToResponse(document);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<DocumentResponseDto> {
    const document = await this.findById(tenantId, id);

    if (document.status === DocumentStatus.ARCHIVED || document.status === DocumentStatus.EXPIRED) {
      throw new BadRequestException('Cannot update archived or expired document');
    }

    if (updateDocumentDto.folderId && updateDocumentDto.folderId !== document.folderId) {
      const folder = await this.prisma.folder.findFirst({
        where: { id: updateDocumentDto.folderId, tenantId, isDeleted: false },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
    }

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: {
        ...updateDocumentDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        folder: true,
        template: true,
      },
    });

    await this.publishEvent('document.updated', updatedDocument);

    return this.mapToResponse(updatedDocument);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const document = await this.findById(tenantId, id);

    await this.prisma.document.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('document.deleted', { id, tenantId });
  }

  async move(tenantId: string, id: string, userId: string, moveDocumentDto: MoveDocumentDto): Promise<DocumentResponseDto> {
    const document = await this.findById(tenantId, id);

    const folder = await this.prisma.folder.findFirst({
      where: { id: moveDocumentDto.folderId, tenantId, isDeleted: false },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: {
        folderId: moveDocumentDto.folderId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: { folder: true },
    });

    return this.mapToResponse(updatedDocument);
  }

  async copy(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    id: string,
    copyDocumentDto: CopyDocumentDto,
  ): Promise<DocumentResponseDto> {
    const document = await this.findById(tenantId, id);

    const existingDoc = await this.prisma.document.findUnique({
      where: { code_tenantId: { code: copyDocumentDto.newCode, tenantId } },
    });

    if (existingDoc) {
      throw new ConflictException('Document code already exists in this tenant');
    }

    const newDocument = await this.prisma.document.create({
      data: {
        code: copyDocumentDto.newCode,
        name: copyDocumentDto.newName,
        description: document.description,
        type: document.type,
        category: document.category,
        status: DocumentStatus.DRAFT,
        mimeType: document.mimeType,
        size: document.size,
        checksum: document.checksum,
        storageProvider: document.storageProvider,
        storagePath: document.storagePath,
        storageUrl: document.storageUrl,
        tags: document.tags,
        metadata: document.metadata,
        retentionPolicy: document.retentionPolicy,
        retentionDate: document.retentionDate,
        classification: document.classification,
        accessLevel: document.accessLevel,
        folderId: copyDocumentDto.folderId || document.folderId,
        templateId: document.templateId,
        tenantId,
        branchId,
        uploadedBy: userId,
      },
    });

    return this.mapToResponse(newDocument);
  }

  async archive(tenantId: string, id: string, userId: string): Promise<DocumentResponseDto> {
    const document = await this.findById(tenantId, id);

    if (document.status === DocumentStatus.ARCHIVED) {
      throw new BadRequestException('Document already archived');
    }

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: {
        status: DocumentStatus.ARCHIVED,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedDocument);
  }

  async restore(tenantId: string, id: string, userId: string): Promise<DocumentResponseDto> {
    const document = await this.findById(tenantId, id);

    if (document.status !== DocumentStatus.ARCHIVED) {
      throw new BadRequestException('Document is not archived');
    }

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: {
        status: DocumentStatus.ACTIVE,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedDocument);
  }

  async download(tenantId: string, id: string, res: any): Promise<void> {
    const document = await this.findById(tenantId, id);

    if (document.storageProvider === 'local') {
      if (fs.existsSync(document.storagePath)) {
        res.setHeader('Content-Type', document.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
        const stream = fs.createReadStream(document.storagePath);
        stream.pipe(res);
      } else {
        throw new NotFoundException('File not found on storage');
      }
    } else {
      // For cloud storage, redirect to storage URL
      if (document.storageUrl) {
        return res.redirect(document.storageUrl);
      }
      throw new NotFoundException('File not available for download');
    }
  }

  async getStats(tenantId: string, branchId: string | undefined): Promise<any> {
    const where: Prisma.DocumentWhereInput = { tenantId, isDeleted: false };
    if (branchId) where.branchId = branchId;

    const [total, byStatus, byType, byClassification, totalSize] = await Promise.all([
      this.prisma.document.count({ where }),
      this.prisma.document.groupBy({ by: ['status'], where, _count: { status: true } }),
      this.prisma.document.groupBy({ by: ['type'], where, _count: { type: true } }),
      this.prisma.document.groupBy({ by: ['classification'], where, _count: { classification: true } }),
      this.prisma.document.aggregate({ where, _sum: { size: true } }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item._count.status }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item._count.type }), {}),
      byClassification: byClassification.reduce((acc, item) => ({ ...acc, [item.classification]: item._count.classification }), {}),
      totalSizeBytes: totalSize._sum.size?.toString() || '0',
    };
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'DOCUMENT',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.uploadedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish document event:', error);
    }
  }

  private mapToResponse(document: Document & { folder?: any; template?: any }): DocumentResponseDto {
    return {
      id: document.id,
      code: document.code,
      name: document.name,
      description: document.description,
      type: document.type,
      category: document.category,
      status: document.status,
      mimeType: document.mimeType,
      size: Number(document.size),
      checksum: document.checksum,
      storageProvider: document.storageProvider,
      storagePath: document.storagePath,
      storageUrl: document.storageUrl,
      version: document.version,
      isLatest: document.isLatest,
      previousVersionId: document.previousVersionId,
      folderId: document.folderId,
      templateId: document.templateId,
      tags: document.tags,
      metadata: document.metadata as Record<string, unknown> | undefined,
      retentionPolicy: document.retentionPolicy,
      retentionDate: document.retentionDate,
      classification: document.classification,
      accessLevel: document.accessLevel,
      tenantId: document.tenantId,
      branchId: document.branchId,
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}