import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { VesselsService } from './vessels.service';
import { CreateVesselDto, UpdateVesselDto, VesselQueryDto, VesselResponseDto } from './dto/vessel.dto';

@ApiTags('Vessels')
@Controller('vessels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VesselsController {
  constructor(private readonly vesselsService: VesselsService) {}

  @Post()
  @Permissions('vessels.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create vessel' })
  @ApiResponse({ status: 201, description: 'Vessel created', type: VesselResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Body() createVesselDto: CreateVesselDto,
  ) {
    return this.vesselsService.create(tenantId, userId, createVesselDto);
  }

  @Get()
  @Permissions('vessels.read')
  @ApiOperation({ summary: 'List vessels' })
  @ApiResponse({ status: 200, description: 'Vessels list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() query: VesselQueryDto,
  ) {
    return this.vesselsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('vessels.read')
  @ApiOperation({ summary: 'Get vessel by ID' })
  @ApiResponse({ status: 200, description: 'Vessel details', type: VesselResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.vesselsService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('vessels.update')
  @ApiOperation({ summary: 'Update vessel' })
  @ApiResponse({ status: 200, description: 'Vessel updated', type: VesselResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateVesselDto: UpdateVesselDto,
  ) {
    return this.vesselsService.update(tenantId, id, userId, updateVesselDto);
  }

  @Delete(':id')
  @Permissions('vessels.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete vessel' })
  @ApiResponse({ status: 200, description: 'Vessel deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.vesselsService.delete(tenantId, id, userId);
    return { message: 'Vessel deleted successfully' };
  }

  @Put(':id/activate')
  @Permissions('vessels.update')
  @ApiOperation({ summary: 'Activate vessel' })
  @ApiResponse({ status: 200, description: 'Vessel activated' })
  async activate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.vesselsService.setActive(tenantId, id, userId, true);
  }

  @Put(':id/deactivate')
  @Permissions('vessels.update')
  @ApiOperation({ summary: 'Deactivate vessel' })
  @ApiResponse({ status: 200, description: 'Vessel deactivated' })
  async deactivate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.vesselsService.setActive(tenantId, id, userId, false);
  }
}