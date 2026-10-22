import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { OCRService } from './ocr.service';
import { ProcessOCRDto, OCRQueryDto, OCRResponseDto } from './dto/ocr.dto';

@ApiTags('OCR')
@Controller('documents/:documentId/ocr')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OCRController {
  constructor(private readonly ocrService: OCRService) {}

  @Post()
  @Permissions('documents.ocr')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process OCR on document' })
  @ApiResponse({ status: 201, description: 'OCR processing started', type: OCRResponseDto })
  async process(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('documentId') documentId: string,
    @Body() processOCRDto: ProcessOCRDto,
  ) {
    return this.ocrService.process(tenantId, documentId, userId, processOCRDto);
  }

  @Get()
  @Permissions('documents.read')
  @ApiOperation({ summary: 'List OCR results for document' })
  @ApiResponse({ status: 200, description: 'OCR results list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Param('documentId') documentId: string,
    @Query() query: OCRQueryDto,
  ) {
    return this.ocrService.findAll(tenantId, documentId, query);
  }

  @Get(':id')
  @Permissions('documents.read')
  @ApiOperation({ summary: 'Get OCR result by ID' })
  @ApiResponse({ status: 200, description: 'OCR result details', type: OCRResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('documentId') documentId: string,
    @Param('id') id: string,
  ) {
    return this.ocrService.findById(tenantId, documentId, id);
  }

  @Put(':id/retry')
  @Permissions('documents.ocr')
  @ApiOperation({ summary: 'Retry failed OCR' })
  @ApiResponse({ status: 200, description: 'OCR retry started' })
  async retry(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('documentId') documentId: string,
    @Param('id') id: string,
  ) {
    return this.ocrService.retry(tenantId, documentId, id, userId);
  }
}