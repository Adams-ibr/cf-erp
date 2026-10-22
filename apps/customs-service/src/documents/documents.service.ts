import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, CustomsDocument, DocumentType, DocumentStatus, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateDocumentDto, DocumentQueryDto, DocumentResponseDto, VerifyDocumentDto } from './dto/document.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class DocumentsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    entryId: string,
    userId: string,
    createDocumentDto: CreateDocumentDto,
  ): Promise<DocumentResponseDto> {
    const entry = await this.prisma.customsEntry.findFirst({
      where: { id: entryId, tenantId, isDeleted: false },
    });
    if (!entry) {
      throw new NotFoundException('Customs entry not found');
    }

    const existingDoc = await this.prisma.customsDocument.findFirst({
      where: { customsEntryId: entryId, type: createDocumentDto.type, isDeleted: false },
    });

    if (existingDoc && ['COMMERCIAL_INVOICE', 'PACKING_LIST', 'BILL_OF_LADING', 'AIRWAY_BILL', 'CERTIFICATE_OF_ORIGIN'].includes(createDocumentDto.type)) {
      throw new ConflictException('Document of this type already exists for this entry');
    }

    const document = await this.prisma.customsDocument.create({
      data: {
        customsEntryId: entryId,
        type: createDocumentDto.type,
        name: createDocumentDto.name,
        url: createDocumentDto.url,
        mimeType: createDocumentDto.mimeType,
        size: createDocumentDto.size,
        status: DocumentStatus.SUBMITTED,
        isRequired: createDocumentDto.isRequired ?? true,
        sequence: createDocumentDto.sequence || 0,
        tenantId,
        uploadedBy: userId,
      },
    });

    await this.publishEvent('customs_document.uploaded', document);

    return this.mapToResponse(document);
  }

  async findAll(
    tenantId: string,
    entryId: string,
    query: DocumentQueryDto,
  ): Promise<PaginatedResult<DocumentResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CustomsDocumentWhereInput = {
      customsEntryId: entryId,
    };

    if (query.type) {
      where.type = query.type as DocumentType;
    }

    if (query.status) {
      where.status = query.status as DocumentStatus;
    }

    if (query.isRequired !== undefined) {
      where.isRequired = query.isRequired;
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { sequence: 'asc', createdAt: 'asc' };

    const [documents, total] = await Promise.all([
      this.prisma.customsDocument.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.customsDocument.count({ where }),
    ]);

    return {
      data: documents.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, entryId: string, id: string): Promise<DocumentResponseDto> {
    const document = await this.prisma.customsDocument.findFirst({
      where: { id, customsEntryId: entryId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.mapToResponse(document);
  }

  async verify(
    tenantId: string,
    entryId: string,
    id: string,
    userId: string,
    verifyDocumentDto: VerifyDocumentDto,
  ): Promise<DocumentResponseDto> {
    const document = await this.findById(tenantId, entryId, id);

    if (verifyDocumentDto.status === 'VERIFIED') {
      if (document.status === DocumentStatus.VERIFIED) {
        throw new ConflictException('Document already verified');
      }

      const updatedDocument = await this.prisma.customsDocument.update({
        where: { id },
        data: {
          status: DocumentStatus.VERIFIED,
          verifiedAt: new Date(),
          verifiedBy: userId,
        },
      });

      await this.checkAllRequiredVerified(tenantId, entryId);

      return this.mapToResponse(updatedDocument);
    } else {
      const updatedDocument = await this.prisma.customsDocument.update({
        where: { id },
        data: {
          status: DocumentStatus.REJECTED,
          rejectionReason: verifyDocumentDto.notes,
        },
      });

      return this.mapToResponse(updatedDocument);
    }
  }

  async delete(tenantId: string, entryId: string, id: string, userId: string): Promise<void> {
    const document = await this.findById(tenantId, entryId, id);

    await this.prisma.customsDocument.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    await this.publishEvent('customs_document.deleted', { id, tenantId });
  }

  private async checkAllRequiredVerified(tenantId: string, entryId: string): Promise<void> {
    const requiredDocs = await this.prisma.customsDocument.findMany({
      where: { customsEntryId: entryId, isRequired: true, isDeleted: false },
    });

    const allVerified = requiredDocs.every(doc => doc.status === DocumentStatus.VERIFIED);

    if (allVerified) {
      const entry = await this.prisma.customsEntry.findFirst({ where: { id: entryId } });
      if (entry && ['DOCUMENTS_SUBMITTED', 'DOCUMENTS_PREPARING'].includes(entry.status)) {
        await this.prisma.customsEntry.update({
          where: { id: entryId },
          data: { status: 'DOCUMENTS_RECEIVED' },
        });
      }
    }
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'CUSTOMS_DOCUMENT',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.uploadedBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish customs document event:', error);
    }
  }

  private mapToResponse(document: CustomsDocument): DocumentResponseDto {
    return {
      id: document.id,
      type: document.type,
      name: document.name,
      url: document.url,
      mimeType: document.mimeType,
      size: document.size,
      status: document.status,
      isRequired: document.isRequired,
      sequence: document.sequence,
      verifiedAt: document.verifiedAt,
      verifiedBy: document.verifiedBy,
      rejectionReason: document.rejectionReason,
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}