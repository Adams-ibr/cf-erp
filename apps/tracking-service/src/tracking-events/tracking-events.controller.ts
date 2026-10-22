import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { TrackingEventsService } from './tracking-events.service';
import { CreateTrackingEventDto, UpdateTrackingEventDto, TrackingEventQueryDto, TrackingEventResponseDto } from './dto/tracking-event.dto';

@ApiTags('Tracking Events')
@Controller('tracking-events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrackingEventsController {
  constructor(private readonly trackingEventsService: TrackingEventsService) {}

  @Post()
  @Permissions('tracking_events.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create tracking event' })
  @ApiResponse({ status: 201, description: 'Tracking event created', type: TrackingEventResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createTrackingEventDto: CreateTrackingEventDto,
  ) {
    return this.trackingEventsService.create(tenantId, branchId, userId, createTrackingEventDto);
  }

  @Get()
  @Permissions('tracking_events.read')
  @ApiOperation({ summary: 'List tracking events' })
  @ApiResponse({ status: 200, description: 'Tracking events list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: TrackingEventQueryDto,
  ) {
    return this.trackingEventsService.findAll(tenantId, branchId, query);
  }

  @Get('stats')
  @Permissions('tracking_events.read')
  @ApiOperation({ summary: 'Get tracking statistics' })
  @ApiResponse({ status: 200, description: 'Tracking statistics' })
  async getStats(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
  ) {
    return this.trackingEventsService.getStats(tenantId, branchId);
  }

  @Get('shipment/:shipmentId')
  @Permissions('tracking_events.read')
  @ApiOperation({ summary: 'Get tracking events for shipment' })
  @ApiResponse({ status: 200, description: 'Shipment tracking events' })
  async findByShipment(
    @CurrentTenantId() tenantId: string,
    @Param('shipmentId') shipmentId: string,
    @Query() query: { page?: number; limit?: number; type?: string },
  ) {
    return this.trackingEventsService.findByShipment(tenantId, shipmentId, query);
  }

  @Get('vessel/:vesselId')
  @Permissions('tracking_events.read')
  @ApiOperation({ summary: 'Get tracking events for vessel' })
  @ApiResponse({ status: 200, description: 'Vessel tracking events' })
  async findByVessel(
    @CurrentTenantId() tenantId: string,
    @Param('vesselId') vesselId: string,
    @Query() query: { page?: number; limit?: number; type?: string },
  ) {
    return this.trackingEventsService.findByVessel(tenantId, vesselId, query);
  }

  @Get('container/:containerId')
  @Permissions('tracking_events.read')
  @ApiOperation({ summary: 'Get tracking events for container' })
  @ApiResponse({ status: 200, description: 'Container tracking events' })
  async findByContainer(
    @CurrentTenantId() tenantId: string,
    @Param('containerId') containerId: string,
    @Query() query: { page?: number; limit?: number; type?: string },
  ) {
    return this.trackingEventsService.findByContainer(tenantId, containerId, query);
  }

  @Get(':id')
  @Permissions('tracking_events.read')
  @ApiOperation({ summary: 'Get tracking event by ID' })
  @ApiResponse({ status: 200, description: 'Tracking event details', type: TrackingEventResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.trackingEventsService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('tracking_events.update')
  @ApiOperation({ summary: 'Update tracking event' })
  @ApiResponse({ status: 200, description: 'Tracking event updated', type: TrackingEventResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateTrackingEventDto: UpdateTrackingEventDto,
  ) {
    return this.trackingEventsService.update(tenantId, id, userId, updateTrackingEventDto);
  }

  @Delete(':id')
  @Permissions('tracking_events.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete tracking event' })
  @ApiResponse({ status: 200, description: 'Tracking event deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.trackingEventsService.delete(tenantId, id, userId);
    return { message: 'Tracking event deleted successfully' };
  }

  @Post('bulk')
  @Permissions('tracking_events.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk create tracking events' })
  @ApiResponse({ status: 201, description: 'Tracking events created' })
  async bulkCreate(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() body: { events: CreateTrackingEventDto[] },
  ) {
    return this.trackingEventsService.bulkCreate(tenantId, branchId, userId, body.events);
  }
}