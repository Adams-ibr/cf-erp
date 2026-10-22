import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto, TemplateQueryDto, TemplateResponseDto, CreateTemplateFieldDto } from './dto/template.dto';

@ApiTags('Templates')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @Permissions('templates.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create template' })
  @ApiResponse({ status: 201, description: 'Template created', type: TemplateResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    return this.templatesService.create(tenantId, branchId, userId, createTemplateDto);
  }

  @Get()
  @Permissions('templates.read')
  @ApiOperation({ summary: 'List templates' })
  @ApiResponse({ status: 200, description: 'Templates list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: TemplateQueryDto,
  ) {
    return this.templatesService.findAll(tenantId, branchId, query);
  }

  @Get(':id')
  @Permissions('templates.read')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template details', type: TemplateResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('templates.update')
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: 200, description: 'Template updated', type: TemplateResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(tenantId, id, userId, updateTemplateDto);
  }

  @Delete(':id')
  @Permissions('templates.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: 200, description: 'Template deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.templatesService.delete(tenantId, id, userId);
    return { message: 'Template deleted successfully' };
  }

  @Post(':id/fields')
  @Permissions('templates.update')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add field to template' })
  @ApiResponse({ status: 201, description: 'Field added' })
  async addField(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() createTemplateFieldDto: CreateTemplateFieldDto,
  ) {
    return this.templatesService.addField(tenantId, id, userId, createTemplateFieldDto);
  }

  @Delete(':id/fields/:fieldId')
  @Permissions('templates.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove field from template' })
  @ApiResponse({ status: 200, description: 'Field removed' })
  async removeField(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('fieldId') fieldId: string,
  ) {
    await this.templatesService.removeField(tenantId, id, fieldId, userId);
    return { message: 'Field removed successfully' };
  }

  @Put(':id/activate')
  @Permissions('templates.update')
  @ApiOperation({ summary: 'Activate template' })
  @ApiResponse({ status: 200, description: 'Template activated' })
  async activate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.setActive(tenantId, id, userId, true);
  }

  @Put(':id/deactivate')
  @Permissions('templates.update')
  @ApiOperation({ summary: 'Deactivate template' })
  @ApiResponse({ status: 200, description: 'Template deactivated' })
  async deactivate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.setActive(tenantId, id, userId, false);
  }
}