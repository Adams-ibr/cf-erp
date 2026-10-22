import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto, UpdateSpaceDto, SpaceQueryDto, SpaceResponseDto } from './dto/space.dto';

@ApiTags('Booking Spaces')
@Controller('bookings/:bookingId/spaces')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @Permissions('bookings.update')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add space to booking' })
  @ApiResponse({ status: 201, description: 'Space added', type: SpaceResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Body() createSpaceDto: CreateSpaceDto,
  ) {
    return this.spacesService.create(tenantId, bookingId, userId, createSpaceDto);
  }

  @Get()
  @Permissions('bookings.read')
  @ApiOperation({ summary: 'List spaces for booking' })
  @ApiResponse({ status: 200, description: 'Spaces list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Param('bookingId') bookingId: string,
    @Query() query: SpaceQueryDto,
  ) {
    return this.spacesService.findAll(tenantId, bookingId, query);
  }

  @Get(':id')
  @Permissions('bookings.read')
  @ApiOperation({ summary: 'Get space by ID' })
  @ApiResponse({ status: 200, description: 'Space details', type: SpaceResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('bookingId') bookingId: string,
    @Param('id') id: string,
  ) {
    return this.spacesService.findById(tenantId, bookingId, id);
  }

  @Put(':id')
  @Permissions('bookings.update')
  @ApiOperation({ summary: 'Update space' })
  @ApiResponse({ status: 200, description: 'Space updated', type: SpaceResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Param('id') id: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ) {
    return this.spacesService.update(tenantId, bookingId, id, userId, updateSpaceDto);
  }

  @Delete(':id')
  @Permissions('bookings.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove space from booking' })
  @ApiResponse({ status: 200, description: 'Space removed' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Param('id') id: string,
  ) {
    await this.spacesService.delete(tenantId, bookingId, id, userId);
    return { message: 'Space removed successfully' };
  }

  @Put(':id/confirm')
  @Permissions('bookings.update')
  @ApiOperation({ summary: 'Confirm space' })
  @ApiResponse({ status: 200, description: 'Space confirmed' })
  async confirm(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Param('id') id: string,
  ) {
    return this.spacesService.confirm(tenantId, bookingId, id, userId);
  }

  @Put(':id/release')
  @Permissions('bookings.update')
  @ApiOperation({ summary: 'Release space' })
  @ApiResponse({ status: 200, description: 'Space released' })
  async release(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Param('id') id: string,
  ) {
    return this.spacesService.release(tenantId, bookingId, id, userId);
  }
}