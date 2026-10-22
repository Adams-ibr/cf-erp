import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto, UpdateInspectionDto, InspectionQueryDto, InspectionResponseDto } from './dto/inspection.dto';

@ApiTags('Customs Inspections')
@Controller('customs-entries/:entryId/inspections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  @Permissions('customs_inspections.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule inspection' })
  @ApiResponse({ status: 201, description: 'Inspection scheduled', type: InspectionResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Body() createInspectionDto: CreateInspectionDto,
  ) {
    return this.inspectionsService.create(tenantId, entryId, userId, createInspectionDto);
  }

  @Get()
  @Permissions('customs_inspections.read')
  @ApiOperation({ summary: 'List inspections for customs entry' })
  @ApiResponse({ status: 200, description: 'Inspections list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Param('entryId') entryId: string,
    @Query() query: InspectionQueryDto,
  ) {
    return this.inspectionsService.findAll(tenantId, entryId, query);
  }

  @Get(':id')
  @Permissions('customs_inspections.read')
  @ApiOperation({ summary: 'Get inspection by ID' })
  @ApiResponse({ status: 200, description: 'Inspection details', type: InspectionResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('entryId') entryId: string,
    @Param('id') id: string,
  ) {
    return this.inspectionsService.findById(tenantId, entryId, id);
  }

  @Put(':id')
  @Permissions('customs_inspections.update')
  @ApiOperation({ summary: 'Update inspection' })
  @ApiResponse({ status: 200, description: 'Inspection updated', type: InspectionResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Param('id') id: string,
    @Body() updateInspectionDto: UpdateInspectionDto,
  ) {
    return this.inspectionsService.update(tenantId, entryId, id, userId, updateInspectionDto);
  }

  @Delete(':id')
  @Permissions('customs_inspections.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete inspection' })
  @ApiResponse({ status: 200, description: 'Inspection deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Param('id') id: string,
  ) {
    await this.inspectionsService.delete(tenantId, entryId, id, userId);
    return { message: 'Inspection deleted successfully' };
  }

  @Put(':id/complete')
  @Permissions('customs_inspections.update')
  @ApiOperation({ summary: 'Complete inspection' })
  @ApiResponse({ status: 200, description: 'Inspection completed' })
  async complete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Param('id') id: string,
    @Body() body: { result: string; findings?: string; notes?: string },
  ) {
    return this.inspectionsService.complete(tenantId, entryId, id, userId, body);
  }
}