import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { VersionsService } from './versions.service';
import { CreateVersionDto, VersionQueryDto, VersionResponseDto } from './dto/version.dto';

@ApiTags('Document Versions')
@Controller('documents/:documentId/versions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Post()
  @Permissions('documents.version_control')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new version' })
  @ApiResponse({ status: 201, description: 'Version created', type: VersionResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('documentId') documentId: string,
    @Body() createVersionDto: CreateVersionDto,
  ) {
    return this.versionsService.create(tenantId, documentId, userId, createVersionDto);
  }

  @Get()
  @Permissions('documents.read')
  @ApiOperation({ summary: 'List document versions' })
  @ApiResponse({ status: 200, description: 'Versions list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Param('documentId') documentId: string,
    @Query() query: VersionQueryDto,
  ) {
    return this.versionsService.findAll(tenantId, documentId, query);
  }

  @Get(':id')
  @Permissions('documents.read')
  @ApiOperation({ summary: 'Get version by ID' })
  @ApiResponse({ status: 200, description: 'Version details', type: VersionResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('documentId') documentId: string,
    @Param('id') id: string,
  ) {
    return this.versionsService.findById(tenantId, documentId, id);
  }

  @Post(':id/restore')
  @Permissions('documents.version_control')
  @ApiOperation({ summary: 'Restore document to this version' })
  @ApiResponse({ status: 200, description: 'Document restored to version' })
  async restore(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('documentId') documentId: string,
    @Param('id') id: string,
  ) {
    return this.versionsService.restore(tenantId, documentId, id, userId);
  }

  @Get(':id/download')
  @Permissions('documents.read')
  @ApiOperation({ summary: 'Download version file' })
  @ApiResponse({ status: 200, description: 'Version file' })
  async download(
    @CurrentTenantId() tenantId: string,
    @Param('documentId') documentId: string,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    return this.versionsService.download(tenantId, documentId, id, res);
  }
}