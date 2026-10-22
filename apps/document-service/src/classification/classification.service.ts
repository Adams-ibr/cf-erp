import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, DocumentClassification, Classification, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { ClassifyDocumentDto, ClassificationQueryDto, ClassificationResponseDto } from './dto/classification.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';
import * as fs from 'fs';

@Injectable()
export class ClassificationService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async classify(
    tenantId: string,
    documentId: string,
    userId: string,
    classifyDocumentDto: ClassifyDocumentDto,
  ): Promise<ClassificationResponseDto> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId, isDeleted: false },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const classification = await this.prisma.documentClassification.create({
      data: {
        documentId,
        classifier: classifyDocumentDto.classifier || 'manual',
        classification: classifyDocumentDto.classification,
        confidence: classifyDocumentDto.confidence,
        labels: classifyDocumentDto.labels,
        metadata: classifyDocumentDto.metadata,
        tenantId,
      },
    });

    // Update document classification
    await this.prisma.document.update({
      where: { id: documentId },
      data: { classification: classifyDocumentDto.classification },
    });

    await this.publishEvent('document.classified', {
      ...classification,
      documentId,
      documentCode: document.code,
    });

    return this.mapToResponse(classification);
  }

  async autoClassify(
    tenantId: string,
    documentId: string,
    userId: string,
  ): Promise<ClassificationResponseDto> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId, isDeleted: false },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Simulate AI classification - in production, integrate with ML model
    const mockClassification = this.simulateAIClassification(document);

    const classification = await this.prisma.documentClassification.create({
      data: {
        documentId,
        classifier: 'ai-classifier-v1',
        classification: mockClassification.classification,
        confidence: mockClassification.confidence,
        labels: mockClassification.labels,
        metadata: {
          model: 'document-classifier-v1',
          processingTime: 150,
          features: mockClassification.features,
        },
        tenantId,
      },
    });

    await this.prisma.document.update({
      where: { id: documentId },
      data: { classification: mockClassification.classification },
    });

    await this.publishEvent('document.auto_classified', {
      ...classification,
      documentId,
      documentCode: document.code,
    });

    return this.mapToResponse(classification);
  }

  private simulateAIClassification(document: any): { classification: Classification; confidence: number; labels: string[]; features: any } {
    // Simple rule-based classification for demo
    const keywords = {
      [Classification.CONFIDENTIAL]: ['confidential', 'secret', 'private', 'sensitive', 'ssn', 'credit card', 'passport'],
      [Classification.RESTRICTED]: ['restricted', 'classified', 'top secret', 'eyes only'],
      [Classification.INTERNAL]: ['invoice', 'shipment', 'purchase order', 'contract', 'internal', 'memo', 'report'],
      [Classification.PUBLIC]: ['public', 'marketing', 'brochure', 'website', 'press release'],
    };

    const text = (document.name + ' ' + (document.description || '')).toLowerCase();
    let bestMatch = Classification.INTERNAL;
    let maxScore = 0;

    for (const [classification, words] of Object.entries(keywords)) {
      const score = words.filter(word => text.includes(word.toLowerCase())).length;
      if (score > maxScore) {
        maxScore = score;
        bestMatch = classification as Classification;
      }
    }

    const confidence = maxScore > 0 ? Math.min(0.95, 0.7 + maxScore * 0.05) : 0.75;
    const labels = this.generateLabels(document, bestMatch);

    return {
      classification: bestMatch,
      confidence,
      labels,
      features: { keywords: maxScore, documentType: document.type },
    };
  }

  private generateLabels(document: any, classification: Classification): string[] {
    const labels = [classification.toLowerCase()];

    if (document.type) labels.push(document.type.toLowerCase());
    if (document.category) labels.push(document.category.toLowerCase());

    // Add category-specific labels
    if (document.name.toLowerCase().includes('invoice')) labels.push('invoice');
    if (document.name.toLowerCase().includes('shipment')) labels.push('shipment');
    if (document.name.toLowerCase().includes('contract')) labels.push('contract');
    if (document.name.toLowerCase().includes('report')) labels.push('report');
    if (document.name.toLowerCase().includes('certificate')) labels.push('certificate');

    return [...new Set(labels)];
  }

  async findAll(
    tenantId: string,
    documentId: string,
    query: ClassificationQueryDto,
  ): Promise<PaginatedResult<ClassificationResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentClassificationWhereInput = {
      documentId,
    };

    if (query.classification) {
      where.classification = query.classification;
    }

    if (query.classifier) {
      where.classifier = query.classifier;
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [classifications, total] = await Promise.all([
      this.prisma.documentClassification.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.documentClassification.count({ where }),
    ]);

    return {
      data: classifications.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, documentId: string, id: string): Promise<ClassificationResponseDto> {
    const classification = await this.prisma.documentClassification.findFirst({
      where: { id, documentId },
    });

    if (!classification) {
      throw new NotFoundException('Classification not found');
    }

    return this.mapToResponse(classification);
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'DOCUMENT_CLASSIFICATION',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.uploadedBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish classification event:', error);
    }
  }

  private mapToResponse(classification: DocumentClassification): ClassificationResponseDto {
    return {
      id: classification.id,
      documentId: classification.documentId,
      classification: classification.classification,
      labels: classification.labels as string[],
      confidence: classification.confidence.toNumber(),
      classifier: classification.classifier,
      metadata: classification.metadata as Record<string, unknown> | undefined,
      createdAt: classification.createdAt,
      updatedAt: classification.updatedAt,
    };
  }
}