import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { CustomsEntriesService } from './customs-entries.service';
import { CreateCustomsEntryDto, UpdateCustomsEntryDto, CustomsEntryQueryDto, CustomsEntryResponseDto, FileCustomsEntryDto, ClearCustomsEntryDto, HoldCustomsEntryDto, ReleaseCustomsEntryDto, AmendCustomsEntryDto } from './dto/customs-entry.dto';

@ApiTags('Customs Entries')
@Controller('customs-entries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomsEntriesController {
  constructor(private readonly customsEntriesService: CustomsEntriesService) {}

  @Post()
  @Permissions('customs_entries.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create customs entry' })
  @ApiResponse({ status: 201, description: 'Customs entry created', type: CustomsEntryResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createCustomsEntryDto: CreateCustomsEntryDto,
  ) {
    return this.customsEntriesService.create(tenantId, branchId, userId, createCustomsEntryDto);
  }

  @Get()
  @Permissions('customs_entries.read')
  @ApiOperation({ summary: 'List customs entries' })
  @ApiResponse({ status: 200, description: 'Customs entries list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: CustomsEntryQueryDto,
  ) {
    return this.customsEntriesService.findAll(tenantId, branchId, query);
  }

  @Get('stats')
  @Permissions('customs_entries.read')
  @ApiOperation({ summary: 'Get customs entry statistics' })
  @ApiResponse({ status: 200, description: 'Customs statistics' })
  async getStats(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
  ) {
    return this.customsEntriesService.getStats(tenantId, branchId);
  }

  @Get(':id')
  @Permissions('customs_entries.read')
  @ApiOperation({ summary: 'Get customs entry by ID' })
  @ApiResponse({ status: 200, description: 'Customs entry details', type: CustomsEntryResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.customsEntriesService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('customs_entries.update')
  @ApiOperation({ summary: 'Update customs entry' })
  @ApiResponse({ status: 200, description: 'Customs entry updated', type: CustomsEntryResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateCustomsEntryDto: UpdateCustomsEntryDto,
  ) {
    return this.customsEntriesService.update(tenantId, id, userId, updateCustomsEntryDto);
  }

  @Delete(':id')
  @Permissions('customs_entries.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete customs entry' })
  @ApiResponse({ status: 200, description: 'Customs entry deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.customsEntriesService.delete(tenantId, id, userId);
    return { message: 'Customs entry deleted successfully' };
  }

  @Post(':id/file')
  @Permissions('customs_entries.file')
  @ApiOperation({ summary: 'File customs entry' })
  @ApiResponse({ status: 200, description: 'Customs entry filed' })
  async file(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() fileCustomsEntryDto: FileCustomsEntryDto,
  ) {
    return this.customsEntriesService.file(tenantId, id, userId, fileCustomsEntryDto);
  }

  @Post(':id/clear')
  @Permissions('customs_entries.clear')
  @ApiOperation({ summary: 'Clear customs entry' })
  @ApiResponse({ status: 200, description: 'Customs entry cleared' })
  async clear(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() clearCustomsEntryDto: ClearCustomsEntryDto,
  ) {
    return this.customsEntriesService.clear(tenantId, id, userId, clearCustomsEntryDto);
  }

  @Post(':id/hold')
  @Permissions('customs_entries.hold')
  @ApiOperation({ summary: 'Put customs entry on hold' })
  @ApiResponse({ status: 200, description: 'Customs entry on hold' })
  async hold(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() holdCustomsEntryDto: HoldCustomsEntryDto,
  ) {
    return this.customsEntriesService.hold(tenantId, id, userId, holdCustomsEntryDto);
  }

  @Post(':id/release')
  @Permissions('customs_entries.release')
  @ApiOperation({ summary: 'Release customs entry from hold' })
  @ApiResponse({ status: 200, description: 'Customs entry released' })
  async release(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() releaseCustomsEntryDto: ReleaseCustomsEntryDto,
  ) {
    return this.customsEntriesService.release(tenantId, id, userId, releaseCustomsEntryDto);
  }

  @Post(':id/amend')
  @Permissions('customs_entries.amend')
  @ApiOperation({ summary: 'Amend customs entry' })
  @ApiResponse({ status: 200, description: 'Customs entry amended' })
  async amend(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() amendCustomsEntryDto: AmendCustomsEntryDto,
  ) {
    return this.customsEntriesService.amend(tenantId, id, userId, amendCustomsEntryDto);
  }

  @Post(':id/lines')
  @Permissions('customs_entries.update')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add line to customs entry' })
  @ApiResponse({ status: 201, description: 'Line added' })
  async addLine(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { lineNumber: number; tariffCodeId?: string; description: string; quantity: number; unit: string; weight?: number; value: number; originCountry: string; dutyRate?: number; taxRate?: number; preferentialRate?: boolean; tradeAgreementId?: string; isHazardous?: boolean; unNumber?: string; imdgClass?: string; packingGroup?: string },
  ) {
    return this.customsEntriesService.addLine(tenantId, id, userId, body);
  }

  @Delete(':id/lines/:lineId')
  @Permissions('customs_entries.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove line from customs entry' })
  @ApiResponse({ status: 200, description: 'Line removed' })
  async removeLine(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('lineId') lineId: string,
  ) {
    await this.customsEntriesService.removeLine(tenantId, id, lineId, userId);
    return { message: 'Line removed successfully' };
  }
}