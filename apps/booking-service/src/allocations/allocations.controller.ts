import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto, AllocationQueryDto, AllocationResponseDto } from './dto/allocation.dto';

@ApiTags('Space Allocations')
@Controller('bookings/:bookingId/spaces/:spaceId/allocations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Post()
  @Permissions('bookings.update')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Allocate container to space' })
  @ApiResponse({ status: 201, description: 'Container allocated', type: AllocationResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Param('spaceId') spaceId: string,
    @Body() createAllocationDto: CreateAllocationDto,
  ) {
    return this.allocationsService.create(tenantId, bookingId, spaceId, userId, createAllocationDto);
  }

  @Get()
  @Permissions('bookings.read')
  @ApiOperation({ summary: 'List allocations for space' })
  @ApiResponse({ status: 200, description: 'Allocations list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Param('bookingId') bookingId: string,
    @Param('spaceId') spaceId: string,
    @Query() query: AllocationQueryDto,
  ) {
    return this.allocationsService.findAll(tenantId, bookingId, spaceId, query);
  }

  @Get(':id')
  @Permissions('bookings.read')
  @ApiOperation({ summary: 'Get allocation by ID' })
  @ApiResponse({ status: 200, description: 'Allocation details', type: AllocationResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('bookingId') bookingId: string,
    @Param('spaceId') spaceId: string,
    @Param('id') id: string,
  ) {
    return this.allocationsService.findById(tenantId, bookingId, spaceId, id);
  }

  @Put(':id/release')
  @Permissions('bookings.update')
  @ApiOperation({ summary: 'Release allocation' })
  @ApiResponse({ status: 200, description: 'Allocation released' })
  async release(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Param('spaceId') spaceId: string,
    @Param('id') id: string,
    @Body() body: { sealNumber?: string; notes?: string },
  ) {
    return this.allocationsService.release(tenantId, bookingId, spaceId, id, userId, body);
  }

  @Delete(':id')
  @Permissions('bookings.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel allocation' })
  @ApiResponse({ status: 200, description: 'Allocation cancelled' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Param('spaceId') spaceId: string,
    @Param('id') id: string,
  ) {
    await this.allocationsService.cancel(tenantId, bookingId, spaceId, id, userId);
    return { message: 'Allocation cancelled successfully' };
  }
}