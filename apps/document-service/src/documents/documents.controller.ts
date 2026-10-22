import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, DocumentQueryDto, DocumentResponseDto, MoveDocumentDto, CopyDocumentDto } from './dto/document.dto';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Permissions('documents.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create document (metadata only, use upload for file)' })
  @ApiResponse({ status: 201, description: 'Document created', type: DocumentResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentsService.create(tenantId, branchId, userId, createDocumentDto);
  }

  @Post('upload')
  @Permissions('documents.create')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document file' })
  @ApiResponse({ status: 201, description: 'Document uploaded', type: DocumentResponseDto })
  async upload(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { code: string; name: string; description?: string; type: string; category?: string; folderId?: string; templateId?: string; tags?: string; metadata?: string; classification?: string; accessLevel?: string },
  ) {
    const createDto: CreateDocumentDto = {
      code: body.code,
      name: body.name,
      description: body.description,
      type: body.type as any,
      category: body.category,
      mimeType: file.mimetype,
      size: file.size,
      checksum: '', // Will be computed
      storageProvider: 'local',
      storagePath: '', // Will be set
      tags: body.tags ? body.tags.split(',') : [],
      metadata: body.metadata ? JSON.parse(body.metadata) : undefined,
      classification: body.classification as any,
      accessLevel: body.accessLevel as any,
      folderId: body.folderId,
      templateId: body.templateId,
    };
    return this.documentsService.upload(tenantId, branchId, userId, file, createDto);
  }

  @Get()
  @Permissions('documents.read')
  @ApiOperation({ summary: 'List documents' })
  @ApiResponse({ status: 200, description: 'Documents list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: DocumentQueryDto,
  ) {
    return this.documentsService.findAll(tenantId, branchId, query);
  }

  @Get('stats')
  @Permissions('documents.read')
  @ApiOperation({ summary: 'Get document statistics' })
  @ApiResponse({ status: 200, description: 'Document statistics' })
  async getStats(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
  ) {
    return this.documentsService.getStats(tenantId, branchId);
  }

  @Get(':id')
  @Permissions('documents.read')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document details', type: DocumentResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.findById(tenantId, id);
  }

  @Get(':id/download')
  @Permissions('documents.read')
  @ApiOperation({ summary: 'Download document' })
  @ApiResponse({ status: 200, description: 'Document file' })
  async download(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    return this.documentsService.download(tenantId, id, res);
  }

  @Put(':id')
  @Permissions('documents.update')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiResponse({ status: 200, description: 'Document updated', type: DocumentResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(tenantId, id, userId, updateDocumentDto);
  }

  @Delete(':id')
  @Permissions('documents.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.documentsService.delete(tenantId, id, userId);
    return { message: 'Document deleted successfully' };
  }

  @Post(':id/move')
  @Permissions('documents.update')
  @ApiOperation({ summary: 'Move document to folder' })
  @ApiResponse({ status: 200, description: 'Document moved' })
  async move(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() moveDocumentDto: MoveDocumentDto,
  ) {
    return this.documentsService.move(tenantId, id, userId, moveDocumentDto);
  }

  @Post(':id/copy')
  @Permissions('documents.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Copy document' })
  @ApiResponse({ status: 201, description: 'Document copied', type: DocumentResponseDto })
  async copy(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() copyDocumentDto: CopyDocumentDto,
  ) {
    return this.documentsService.copy(tenantId, branchId, userId, id, copyDocumentDto);
  }

  @Post(':id/archive')
  @Permissions('documents.update')
  @ApiOperation({ summary: 'Archive document' })
  @ApiResponse({ status: 200, description: 'Document archived' })
  async archive(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.archive(tenantId, id, userId);
  }

  @Post(':id/restore')
  @Permissions('documents.update')
  @ApiOperation({ summary: 'Restore archived document' })
  @ApiResponse({ status: 200, description: 'Document restored' })
  async restore(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.restore(tenantId, id, userId);
  }
}