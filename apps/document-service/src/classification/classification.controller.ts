import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { ClassificationService } from './classification.service';
import { ClassifyDocumentDto, ClassificationQueryDto, ClassificationResponseDto } from './dto/classification.dto';

@ApiTags('Document Classification')
@Controller('documents/:documentId/classifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClassificationController {
  constructor(private readonly classificationService: ClassificationService) {}

  @Post()
  @Permissions('documents.classify')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Classify document' })
  @ApiResponse({ status: 201, description: 'Document classified', type: ClassificationResponseDto })
  async classify(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('documentId') documentId: string,
    @Body() classifyDocumentDto: ClassifyDocumentDto,
  ) {
    return this.classificationService.classify(tenantId, documentId, userId, classifyDocumentDto);
  }

  @Get()
  @Permissions('documents.read')
  @ApiOperation({ summary: 'List classifications for document' })
  @ApiResponse({ status: 200, description: 'Classifications list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Param('documentId') documentId: string,
    @Query() query: ClassificationQueryDto,
  ) {
    return this.classificationService.findAll(tenantId, documentId, query);
  }

  @Get(':id')
  @Permissions('documents.read')
  @ApiOperation({ summary: 'Get classification by ID' })
  @ApiResponse({ status: 200, description: 'Classification details', type: ClassificationResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('documentId') documentId: string,
    @Param('id') id: string,
  ) {
    return this.classificationService.findById(tenantId, documentId, id);
  }

  @Post('auto-classify')
  @Permissions('documents.classify')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Auto-classify document using AI' })
  @ApiResponse({ status: 201, description: 'Document auto-classified', type: ClassificationResponseDto })
  async autoClassify(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.classificationService.autoClassify(tenantId, documentId, userId);
  }
}