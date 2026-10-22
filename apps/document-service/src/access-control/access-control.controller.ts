import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { AccessControlService } from './access-control.service';
import { CreateAccessRuleDto, AccessRuleQueryDto, AccessRuleResponseDto, CreateShareDto, ShareResponseDto } from './dto/access-control.dto';

@ApiTags('Access Control')
@Controller('access-control')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Post('documents/:documentId/rules')
  @Permissions('documents.manage_access')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add access rule to document' })
  @ApiResponse({ status: 201, description: 'Access rule added', type: AccessRuleResponseDto })
  async addDocumentRule(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('documentId') documentId: string,
    @Body() createAccessRuleDto: CreateAccessRuleDto,
  ) {
    return this.accessControlService.addDocumentRule(tenantId, documentId, userId, createAccessRuleDto);
  }

  @Get('documents/:documentId/rules')
  @Permissions('documents.read')
  @ApiOperation({ summary: 'List document access rules' })
  @ApiResponse({ status: 200, description: 'Access rules list' })
  async getDocumentRules(
    @CurrentTenantId() tenantId: string,
    @Param('documentId') documentId: string,
    @Query() query: AccessRuleQueryDto,
  ) {
    return this.accessControlService.getDocumentRules(tenantId, documentId, query);
  }

  @Delete('documents/:documentId/rules/:ruleId')
  @Permissions('documents.manage_access')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove document access rule' })
  @ApiResponse({ status: 200, description: 'Access rule removed' })
  async removeDocumentRule(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('documentId') documentId: string,
    @Param('ruleId') ruleId: string,
  ) {
    await this.accessControlService.removeDocumentRule(tenantId, documentId, ruleId, userId);
    return { message: 'Access rule removed successfully' };
  }

  @Post('folders/:folderId/rules')
  @Permissions('folders.manage_access')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add access rule to folder' })
  @ApiResponse({ status: 201, description: 'Access rule added', type: AccessRuleResponseDto })
  async addFolderRule(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('folderId') folderId: string,
    @Body() createAccessRuleDto: CreateAccessRuleDto,
  ) {
    return this.accessControlService.addFolderRule(tenantId, folderId, userId, createAccessRuleDto);
  }

  @Get('folders/:folderId/rules')
  @Permissions('folders.read')
  @ApiOperation({ summary: 'List folder access rules' })
  @ApiResponse({ status: 200, description: 'Access rules list' })
  async getFolderRules(
    @CurrentTenantId() tenantId: string,
    @Param('folderId') folderId: string,
    @Query() query: AccessRuleQueryDto,
  ) {
    return this.accessControlService.getFolderRules(tenantId, folderId, query);
  }

  @Delete('folders/:folderId/rules/:ruleId')
  @Permissions('folders.manage_access')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove folder access rule' })
  @ApiResponse({ status: 200, description: 'Access rule removed' })
  async removeFolderRule(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('folderId') folderId: string,
    @Param('ruleId') ruleId: string,
  ) {
    await this.accessControlService.removeFolderRule(tenantId, folderId, ruleId, userId);
    return { message: 'Access rule removed successfully' };
  }

  @Post('documents/:documentId/shares')
  @Permissions('documents.share')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Share document' })
  @ApiResponse({ status: 201, description: 'Document shared', type: ShareResponseDto })
  async shareDocument(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('documentId') documentId: string,
    @Body() createShareDto: CreateShareDto,
  ) {
    return this.accessControlService.shareDocument(tenantId, documentId, userId, createShareDto);
  }

  @Get('documents/:documentId/shares')
  @Permissions('documents.read')
  @ApiOperation({ summary: 'List document shares' })
  @ApiResponse({ status: 200, description: 'Shares list' })
  async getDocumentShares(
    @CurrentTenantId() tenantId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.accessControlService.getDocumentShares(tenantId, documentId);
  }

  @Delete('documents/:documentId/shares/:shareId')
  @Permissions('documents.share')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke document share' })
  @ApiResponse({ status: 200, description: 'Share revoked' })
  async revokeShare(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('documentId') documentId: string,
    @Param('shareId') shareId: string,
  ) {
    await this.accessControlService.revokeShare(tenantId, documentId, shareId, userId);
    return { message: 'Share revoked successfully' };
  }

  @Get('shares/:token')
  @ApiOperation({ summary: 'Access shared document by token' })
  @ApiResponse({ status: 200, description: 'Shared document access' })
  async accessSharedDocument(
    @Param('token') token: string,
  ) {
    return this.accessControlService.accessSharedDocument(token);
  }
}