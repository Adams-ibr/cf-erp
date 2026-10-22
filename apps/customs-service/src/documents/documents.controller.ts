import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, DocumentQueryDto, DocumentResponseDto, VerifyDocumentDto } from './dto/document.dto';

@ApiTags('Customs Documents')
@Controller('customs-entries/:entryId/documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Permissions('customs_documents.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload document' })
  @ApiResponse({ status: 201, description: 'Document uploaded', type: DocumentResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentsService.create(tenantId, entryId, userId, createDocumentDto);
  }

  @Get()
  @Permissions('customs_documents.read')
  @ApiOperation({ summary: 'List documents for customs entry' })
  @ApiResponse({ status: 200, description: 'Documents list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Param('entryId') entryId: string,
    @Query() query: DocumentQueryDto,
  ) {
    return this.documentsService.findAll(tenantId, entryId, query);
  }

  @Get(':id')
  @Permissions('customs_documents.read')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document details', type: DocumentResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('entryId') entryId: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.findById(tenantId, entryId, id);
  }

  @Put(':id/verify')
  @Permissions('customs_documents.verify')
  @ApiOperation({ summary: 'Verify document' })
  @ApiResponse({ status: 200, description: 'Document verified' })
  async verify(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Param('id') id: string,
    @Body() verifyDocumentDto: VerifyDocumentDto,
  ) {
    return this.documentsService.verify(tenantId, entryId, id, userId, verifyDocumentDto);
  }

  @Delete(':id')
  @Permissions('customs_documents.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Param('id') id: string,
  ) {
    await this.documentsService.delete(tenantId, entryId, id, userId);
    return { message: 'Document deleted successfully' };
  }
}