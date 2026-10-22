import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { FoldersService } from './folders.service';
import { CreateFolderDto, UpdateFolderDto, FolderQueryDto, FolderResponseDto } from './dto/folder.dto';

@ApiTags('Folders')
@Controller('folders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @Permissions('folders.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create folder' })
  @ApiResponse({ status: 201, description: 'Folder created', type: FolderResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    return this.foldersService.create(tenantId, branchId, userId, createFolderDto);
  }

  @Get()
  @Permissions('folders.read')
  @ApiOperation({ summary: 'List folders' })
  @ApiResponse({ status: 200, description: 'Folders list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: FolderQueryDto,
  ) {
    return this.foldersService.findAll(tenantId, branchId, query);
  }

  @Get('tree')
  @Permissions('folders.read')
  @ApiOperation({ summary: 'Get folder tree' })
  @ApiResponse({ status: 200, description: 'Folder tree' })
  async getTree(@CurrentTenantId() tenantId: string) {
    return this.foldersService.getTree(tenantId);
  }

  @Get(':id')
  @Permissions('folders.read')
  @ApiOperation({ summary: 'Get folder by ID' })
  @ApiResponse({ status: 200, description: 'Folder details', type: FolderResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.foldersService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('folders.update')
  @ApiOperation({ summary: 'Update folder' })
  @ApiResponse({ status: 200, description: 'Folder updated', type: FolderResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.foldersService.update(tenantId, id, userId, updateFolderDto);
  }

  @Delete(':id')
  @Permissions('folders.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete folder' })
  @ApiResponse({ status: 200, description: 'Folder deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.foldersService.delete(tenantId, id, userId);
    return { message: 'Folder deleted successfully' };
  }

  @Post(':id/access-rules')
  @Permissions('folders.manage_access')
  @ApiOperation({ summary: 'Add access rule to folder' })
  @ApiResponse({ status: 201, description: 'Access rule added' })
  async addAccessRule(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { principalType: string; principalId: string; permission: string; expiresAt?: Date; inherits?: boolean; conditions?: Record<string, unknown> },
  ) {
    return this.foldersService.addAccessRule(tenantId, id, userId, body);
  }

  @Delete(':id/access-rules/:ruleId')
  @Permissions('folders.manage_access')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove access rule from folder' })
  @ApiResponse({ status: 200, description: 'Access rule removed' })
  async removeAccessRule(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('ruleId') ruleId: string,
  ) {
    await this.foldersService.removeAccessRule(tenantId, id, ruleId, userId);
    return { message: 'Access rule removed successfully' };
  }
}