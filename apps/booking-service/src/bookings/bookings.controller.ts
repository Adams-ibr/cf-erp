import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto, BookingResponseDto, ConfirmBookingDto, CancelBookingDto, AmendBookingDto } from './dto/booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Permissions('bookings.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create booking' })
  @ApiResponse({ status: 201, description: 'Booking created', type: BookingResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(tenantId, branchId, userId, createBookingDto);
  }

  @Get()
  @Permissions('bookings.read')
  @ApiOperation({ summary: 'List bookings' })
  @ApiResponse({ status: 200, description: 'Bookings list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: BookingQueryDto,
  ) {
    return this.bookingsService.findAll(tenantId, branchId, query);
  }

  @Get('stats')
  @Permissions('bookings.read')
  @ApiOperation({ summary: 'Get booking statistics' })
  @ApiResponse({ status: 200, description: 'Booking statistics' })
  async getStats(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
  ) {
    return this.bookingsService.getStats(tenantId, branchId);
  }

  @Get(':id')
  @Permissions('bookings.read')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking details', type: BookingResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.bookingsService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('bookings.update')
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: 200, description: 'Booking updated', type: BookingResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(tenantId, id, userId, updateBookingDto);
  }

  @Delete(':id')
  @Permissions('bookings.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete booking' })
  @ApiResponse({ status: 200, description: 'Booking deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.bookingsService.delete(tenantId, id, userId);
    return { message: 'Booking deleted successfully' };
  }

  @Post(':id/confirm')
  @Permissions('bookings.confirm')
  @ApiOperation({ summary: 'Confirm booking' })
  @ApiResponse({ status: 200, description: 'Booking confirmed' })
  async confirm(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() confirmBookingDto: ConfirmBookingDto,
  ) {
    return this.bookingsService.confirm(tenantId, id, userId, confirmBookingDto);
  }

  @Post(':id/cancel')
  @Permissions('bookings.cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  async cancel(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() cancelBookingDto: CancelBookingDto,
  ) {
    return this.bookingsService.cancel(tenantId, id, userId, cancelBookingDto);
  }

  @Post(':id/amend')
  @Permissions('bookings.amend')
  @ApiOperation({ summary: 'Amend booking' })
  @ApiResponse({ status: 200, description: 'Booking amended' })
  async amend(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() amendBookingDto: AmendBookingDto,
  ) {
    return this.bookingsService.amend(tenantId, id, userId, amendBookingDto);
  }

  @Post(':id/split')
  @Permissions('bookings.split')
  @ApiOperation({ summary: 'Split booking' })
  @ApiResponse({ status: 201, description: 'Booking split' })
  async split(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { newCode: string; spaces: Array<{ containerType: string; containerCount: number }> },
  ) {
    return this.bookingsService.split(tenantId, branchId, userId, id, body);
  }

  @Post(':id/roll')
  @Permissions('bookings.roll')
  @ApiOperation({ summary: 'Roll booking to next voyage' })
  @ApiResponse({ status: 200, description: 'Booking rolled' })
  async roll(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { newVoyageId: string; reason?: string },
  ) {
    return this.bookingsService.roll(tenantId, id, userId, body);
  }

  @Post(':id/hold')
  @Permissions('bookings.hold')
  @ApiOperation({ summary: 'Put booking on hold' })
  @ApiResponse({ status: 200, description: 'Booking on hold' })
  async hold(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.bookingsService.hold(tenantId, id, userId, body.reason);
  }

  @Post(':id/release')
  @Permissions('bookings.release')
  @ApiOperation({ summary: 'Release booking from hold' })
  @ApiResponse({ status: 200, description: 'Booking released' })
  async release(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.bookingsService.release(tenantId, id, userId);
  }
}