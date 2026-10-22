import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, OCRResult, OCRStatus, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { ProcessOCRDto, OCRQueryDto, OCRResponseDto } from './dto/ocr.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OCRService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async process(
    tenantId: string,
    documentId: string,
    userId: string,
    processOCRDto: ProcessOCRDto,
  ): Promise<OCRResponseDto> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId, isDeleted: false },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff', 'image/bmp'];
    if (!allowedMimeTypes.includes(document.mimeType)) {
      throw new BadRequestException('Document type not supported for OCR');
    }

    const existingOCR = await this.prisma.ocrResult.findFirst({
      where: { documentId, status: { in: [OCRStatus.PENDING, OCRStatus.PROCESSING] } },
    });

    if (existingOCR) {
      throw new BadRequestException('OCR already in progress for this document');
    }

    const ocrResult = await this.prisma.ocrResult.create({
      data: {
        documentId,
        engine: processOCRDto.engine || 'tesseract',
        language: processOCRDto.language || 'eng',
        status: OCRStatus.PENDING,
        tenantId,
      },
    });

    // Process OCR asynchronously
    this.processOCRAsync(tenantId, documentId, ocrResult.id, processOCRDto);

    return this.mapToResponse(ocrResult);
  }

  private async processOCRAsync(
    tenantId: string,
    documentId: string,
    ocrResultId: string,
    processOCRDto: ProcessOCRDto,
  ): Promise<void> {
    try {
      await this.prisma.ocrResult.update({
        where: { id: ocrResultId },
        data: { status: OCRStatus.PROCESSING },
      });

      const document = await this.prisma.document.findFirst({
        where: { id: documentId, tenantId, isDeleted: false },
      });

      if (!document || !fs.existsSync(document.storagePath)) {
        await this.prisma.ocrResult.update({
          where: { id: ocrResultId },
          data: { status: OCRStatus.FAILED, errorMessage: 'Document file not found' },
        });
        return;
      }

      // Simulate OCR processing - in production, integrate with Tesseract, AWS Textract, Google Vision, etc.
      const startTime = Date.now();
      
      // Mock OCR result
      const mockExtractedText = `Extracted text from ${document.name}\n\nThis is a mock OCR result.\nDocument type: ${document.type}\nCategory: ${document.category || 'N/A'}\nUploaded: ${document.createdAt.toISOString()}`;
      const mockConfidence = 95.5;
      const mockStructuredData = {
        fields: [
          { name: 'invoice_number', value: 'INV-2024-001', confidence: 98 },
          { name: 'date', value: '2024-01-15', confidence: 95 },
          { name: 'total_amount', value: '$1,234.56', confidence: 92 },
        ],
        tables: [
          {
            headers: ['Item', 'Quantity', 'Unit Price', 'Total'],
            rows: [
              ['Product A', '10', '$50.00', '$500.00'],
              ['Product B', '5', '$75.00', '$375.00'],
            ],
          },
        ],
      };
      const mockBoundingBoxes = [
        { page: 1, x: 100, y: 100, width: 200, height: 30, text: 'INVOICE', confidence: 99 },
        { page: 1, x: 100, y: 150, width: 300, height: 20, text: 'INV-2024-001', confidence: 98 },
      ];

      const processingTime = Date.now() - startTime;

      await this.prisma.ocrResult.update({
        where: { id: ocrResultId },
        data: {
          status: OCRStatus.COMPLETED,
          extractedText: mockExtractedText,
          structuredData: mockStructuredData,
          boundingBoxes: mockBoundingBoxes,
          confidence: mockConfidence,
          processingTime,
        },
      });

      await this.publishEvent('ocr.completed', {
        id: ocrResultId,
        documentId,
        confidence: mockConfidence,
      });
    } catch (error) {
      await this.prisma.ocrResult.update({
        where: { id: ocrResultId },
        data: {
          status: OCRStatus.FAILED,
          errorMessage: error.message,
        },
      });

      await this.publishEvent('ocr.failed', {
        id: ocrResultId,
        documentId,
        error: error.message,
      });
    }
  }

  async findAll(
    tenantId: string,
    documentId: string,
    query: OCRQueryDto,
  ): Promise<PaginatedResult<OCRResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.OCRResultWhereInput = {
      documentId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.engine) {
      where.engine = query.engine;
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [results, total] = await Promise.all([
      this.prisma.ocrResult.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.ocrResult.count({ where }),
    ]);

    return {
      data: results.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, documentId: string, id: string): Promise<OCRResponseDto> {
    const result = await this.prisma.ocrResult.findFirst({
      where: { id, documentId },
    });

    if (!result) {
      throw new NotFoundException('OCR result not found');
    }

    return this.mapToResponse(result);
  }

  async retry(tenantId: string, documentId: string, id: string, userId: string): Promise<OCRResponseDto> {
    const result = await this.findById(tenantId, documentId, id);

    if (result.status !== OCRStatus.FAILED) {
      throw new BadRequestException('Can only retry failed OCR');
    }

    await this.prisma.ocrResult.update({
      where: { id },
      data: { status: OCRStatus.PENDING, errorMessage: null },
    });

    // Retry processing
    this.processOCRAsync(tenantId, documentId, id, { engine: result.engine, language: result.language });

    return this.findById(tenantId, documentId, id);
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'OCR_RESULT',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.uploadedBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish OCR event:', error);
    }
  }

  private mapToResponse(result: OCRResult): OCRResponseDto {
    return {
      id: result.id,
      documentId: result.documentId,
      engine: result.engine,
      language: result.language,
      confidence: result.confidence?.toNumber() || 0,
      extractedText: result.extractedText,
      structuredData: result.structuredData as Record<string, unknown> | undefined,
      boundingBoxes: result.boundingBoxes as Record<string, unknown> | undefined,
      processingTime: result.processingTime,
      status: result.status,
      errorMessage: result.errorMessage,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}