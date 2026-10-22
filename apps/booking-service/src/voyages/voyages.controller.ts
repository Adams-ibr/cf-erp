import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { VoyagesService } from './voyages.service';
import { CreateVoyageDto, UpdateVoyageDto, VoyageQueryDto, VoyageResponseDto, AddScheduleDto } from './dto/voyage.dto';

@ApiTags('Voyages')
@Controller('voyages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VoyagesController {
  constructor(private readonly voyagesService: VoyagesService) {}

  @Post()
  @Permissions('voyages.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create voyage' })
  @ApiResponse({ status: 201, description: 'Voyage created', type: VoyageResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Body() createVoyageDto: CreateVoyageDto,
  ) {
    return this.voyagesService.create(tenantId, userId, createVoyageDto);
  }

  @Get()
  @Permissions('voyages.read')
  @ApiOperation({ summary: 'List voyages' })
  @ApiResponse({ status: 200, description: 'Voyages list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() query: VoyageQueryDto,
  ) {
    return this.voyagesService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('voyages.read')
  @ApiOperation({ summary: 'Get voyage by ID' })
  @ApiResponse({ status: 200, description: 'Voyage details', type: VoyageResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.voyagesService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('voyages.update')
  @ApiOperation({ summary: 'Update voyage' })
  @ApiResponse({ status: 200, description: 'Voyage updated', type: VoyageResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateVoyageDto: UpdateVoyageDto,
  ) {
    return this.voyagesService.update(tenantId, id, userId, updateVoyageDto);
  }

  @Delete(':id')
  @Permissions('voyages.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete voyage' })
  @ApiResponse({ status: 200, description: 'Voyage deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.voyagesService.delete(tenantId, id, userId);
    return { message: 'Voyage deleted successfully' };
  }

  @Post(':id/schedule')
  @Permissions('voyages.update')
  @ApiOperation({ summary: 'Add port to voyage schedule' })
  @ApiResponse({ status: 201, description: 'Schedule added' })
  async addSchedule(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() addScheduleDto: AddScheduleDto,
  ) {
    return this.voyagesService.addSchedule(tenantId, id, userId, addScheduleDto);
  }

  @Delete(':id/schedule/:scheduleId')
  @Permissions('voyages.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove port from voyage schedule' })
  @ApiResponse({ status: 200, description: 'Schedule removed' })
  async removeSchedule(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    await this.voyagesService.removeSchedule(tenantId, id, scheduleId, userId);
    return { message: 'Schedule removed successfully' };
  }

  @Put(':id/status')
  @Permissions('voyages.update_status')
  @ApiOperation({ summary: 'Update voyage status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.voyagesService.updateStatus(tenantId, id, userId, body.status, body.notes);
  }

  @Put(':id/activate')
  @Permissions('voyages.update')
  @ApiOperation({ summary: 'Activate voyage' })
  @ApiResponse({ status: 200, description: 'Voyage activated' })
  async activate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.voyagesService.setActive(tenantId, id, userId, true);
  }

  @Put(':id/deactivate')
  @Permissions('voyages.update')
  @ApiOperation({ summary: 'Deactivate voyage' })
  @ApiResponse({ status: 200, description: 'Voyage deactivated' })
  async deactivate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.voyagesService.setActive(tenantId, id, userId, false);
  }
}