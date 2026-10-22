import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Booking, BookingStatus, BookingType, ShipmentMode, ShipmentDirection, Incoterm, SpaceStatus, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto, BookingResponseDto, CreateBookingSpaceDto, ConfirmBookingDto, CancelBookingDto, AmendBookingDto } from './dto/booking.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient, EventTypes } from '@cf-erp/messaging';

@Injectable()
export class BookingsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const existingBooking = await this.prisma.booking.findUnique({
      where: { code_tenantId: { code: createBookingDto.code, tenantId } },
    });

    if (existingBooking) {
      throw new ConflictException('Booking code already exists in this tenant');
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: createBookingDto.customerId, tenantId, isDeleted: false },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (createBookingDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createBookingDto.supplierId, tenantId, isDeleted: false },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    const carrier = await this.prisma.carrier.findFirst({
      where: { id: createBookingDto.carrierId, tenantId, isDeleted: false },
    });
    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    if (createBookingDto.vesselId) {
      const vessel = await this.prisma.vessel.findFirst({
        where: { id: createBookingDto.vesselId, tenantId, isDeleted: false },
      });
      if (!vessel) {
        throw new NotFoundException('Vessel not found');
      }
    }

    if (createBookingDto.voyageId) {
      const voyage = await this.prisma.voyage.findFirst({
        where: { id: createBookingDto.voyageId, tenantId, isDeleted: false },
      });
      if (!voyage) {
        throw new NotFoundException('Voyage not found');
      }
      if (voyage.status !== 'SCHEDULED' && voyage.status !== 'IN_PROGRESS') {
        throw new BadRequestException('Voyage is not available for booking');
      }
    }

    if (createBookingDto.jobId) {
      const job = await this.prisma.job.findFirst({
        where: { id: createBookingDto.jobId, tenantId, isDeleted: false },
      });
      if (!job) {
        throw new NotFoundException('Job not found');
      }
    }

    if (createBookingDto.shipmentId) {
      const shipment = await this.prisma.shipment.findFirst({
        where: { id: createBookingDto.shipmentId, tenantId, isDeleted: false },
      });
      if (!shipment) {
        throw new NotFoundException('Shipment not found');
      }
    }

    const booking = await this.prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          code: createBookingDto.code,
          reference: createBookingDto.reference,
          type: createBookingDto.type || BookingType.FCL,
          status: createBookingDto.status || BookingStatus.REQUESTED,
          mode: createBookingDto.mode || ShipmentMode.SEA_FCL,
          direction: createBookingDto.direction || ShipmentDirection.IMPORT,
          incoterm: createBookingDto.incoterm || Incoterm.FOB,
          currency: createBookingDto.currency || 'USD',
          exchangeRate: createBookingDto.exchangeRate ? new Prisma.Decimal(createBookingDto.exchangeRate) : new Prisma.Decimal(1),
          customerId: createBookingDto.customerId,
          supplierId: createBookingDto.supplierId,
          carrierId: createBookingDto.carrierId,
          vesselId: createBookingDto.vesselId,
          voyageId: createBookingDto.voyageId,
          jobId: createBookingDto.jobId,
          shipmentId: createBookingDto.shipmentId,
          origin: createBookingDto.origin,
          destination: createBookingDto.destination,
          pol: createBookingDto.pol,
          pod: createBookingDto.pod,
          finalDestination: createBookingDto.finalDestination,
          commodity: createBookingDto.commodity,
          weight: createBookingDto.weight ? new Prisma.Decimal(createBookingDto.weight) : null,
          volume: createBookingDto.volume ? new Prisma.Decimal(createBookingDto.volume) : null,
          quantity: createBookingDto.quantity,
          unit: createBookingDto.unit,
          value: createBookingDto.value ? new Prisma.Decimal(createBookingDto.value) : null,
          insuranceValue: createBookingDto.insuranceValue ? new Prisma.Decimal(createBookingDto.insuranceValue) : null,
          hazardousClass: createBookingDto.hazardousClass,
          unNumber: createBookingDto.unNumber,
          imdgClass: createBookingDto.imdgClass,
          packingGroup: createBookingDto.packingGroup,
          pickupDate: createBookingDto.pickupDate,
          deliveryDate: createBookingDto.deliveryDate,
          cutoffDate: createBookingDto.cutoffDate,
          etd: createBookingDto.etd,
          eta: createBookingDto.eta,
          notes: createBookingDto.notes,
          internalNotes: createBookingDto.internalNotes,
          terms: createBookingDto.terms,
          tenantId,
          branchId,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      if (createBookingDto.spaces && createBookingDto.spaces.length > 0) {
        await tx.bookingSpace.createMany({
          data: createBookingDto.spaces.map(space => ({
            bookingId: newBooking.id,
            containerType: space.containerType as any,
            containerCount: space.containerCount,
            weightLimit: space.weightLimit ? new Prisma.Decimal(space.weightLimit) : null,
            volumeLimit: space.volumeLimit ? new Prisma.Decimal(space.volumeLimit) : null,
            rateId: space.rateId,
            rateAmount: space.rateAmount ? new Prisma.Decimal(space.rateAmount) : null,
            rateCurrency: space.rateCurrency,
            status: SpaceStatus.REQUESTED,
            tenantId,
          })),
        });
      }

      await tx.activity.create({
        data: {
          type: 'BOOKING_CREATED',
          subject: `Booking ${newBooking.code} created`,
          bookingId: newBooking.id,
          tenantId,
        },
      });

      return newBooking;
    });

    await this.publishEvent(EventTypes.BOOKING.CREATED, booking);

    return this.findById(tenantId, booking.id);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: BookingQueryDto,
  ): Promise<PaginatedResult<BookingResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.status) {
      where.status = query.status as BookingStatus;
    }

    if (query.type) {
      where.type = query.type as BookingType;
    }

    if (query.mode) {
      where.mode = query.mode as ShipmentMode;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.carrierId) {
      where.carrierId = query.carrierId;
    }

    if (query.vesselId) {
      where.vesselId = query.vesselId;
    }

    if (query.voyageId) {
      where.voyageId = query.voyageId;
    }

    if (query.jobId) {
      where.jobId = query.jobId;
    }

    if (query.shipmentId) {
      where.shipmentId = query.shipmentId;
    }

    if (query.origin) {
      where.origin = { contains: query.origin, mode: 'insensitive' };
    }

    if (query.destination) {
      where.destination = { contains: query.destination, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { reference: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { carrier: { name: { contains: query.search, mode: 'insensitive' } } },
        { origin: { contains: query.search, mode: 'insensitive' } },
        { destination: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          spaces: {
            include: {
              allocations: { include: { container: true } },
              rate: true,
            },
          },
          customer: true,
          supplier: true,
          carrier: true,
          vessel: true,
          voyage: true,
          job: true,
          shipment: true,
          _count: { select: { documents: true, activities: true, costs: true, revenues: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        spaces: {
          include: {
            allocations: { include: { container: true } },
            rate: true,
          },
        },
        customer: true,
        supplier: true,
        carrier: true,
        vessel: true,
        voyage: true,
        job: true,
        shipment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.mapToResponse(booking);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.findById(tenantId, id);

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.EXPIRED) {
      throw new BadRequestException('Cannot update cancelled or expired booking');
    }

    if (updateBookingDto.carrierId && updateBookingDto.carrierId !== booking.carrierId) {
      const carrier = await this.prisma.carrier.findFirst({
        where: { id: updateBookingDto.carrierId, tenantId, isDeleted: false },
      });
      if (!carrier) {
        throw new NotFoundException('Carrier not found');
      }
    }

    if (updateBookingDto.vesselId && updateBookingDto.vesselId !== booking.vesselId) {
      const vessel = await this.prisma.vessel.findFirst({
        where: { id: updateBookingDto.vesselId, tenantId, isDeleted: false },
      });
      if (!vessel) {
        throw new NotFoundException('Vessel not found');
      }
    }

    if (updateBookingDto.voyageId && updateBookingDto.voyageId !== booking.voyageId) {
      const voyage = await this.prisma.voyage.findFirst({
        where: { id: updateBookingDto.voyageId, tenantId, isDeleted: false },
      });
      if (!voyage) {
        throw new NotFoundException('Voyage not found');
      }
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        ...updateBookingDto,
        exchangeRate: updateBookingDto.exchangeRate ? new Prisma.Decimal(updateBookingDto.exchangeRate) : undefined,
        weight: updateBookingDto.weight ? new Prisma.Decimal(updateBookingDto.weight) : undefined,
        volume: updateBookingDto.volume ? new Prisma.Decimal(updateBookingDto.volume) : undefined,
        value: updateBookingDto.value ? new Prisma.Decimal(updateBookingDto.value) : undefined,
        insuranceValue: updateBookingDto.insuranceValue ? new Prisma.Decimal(updateBookingDto.insuranceValue) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        spaces: {
          include: {
            allocations: { include: { container: true } },
            rate: true,
          },
        },
        customer: true,
        supplier: true,
        carrier: true,
        vessel: true,
        voyage: true,
        job: true,
        shipment: true,
      },
    });

    await this.publishEvent(EventTypes.BOOKING.UPDATED, updatedBooking);

    return this.mapToResponse(updatedBooking);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const booking = await this.findById(tenantId, id);

    if (booking.status === BookingStatus.BOOKED || booking.status === BookingStatus.CONFIRMED) {
      throw new BadRequestException('Cannot delete confirmed or booked booking');
    }

    await this.prisma.booking.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent(EventTypes.BOOKING.DELETED, { id, tenantId });
  }

  async confirm(tenantId: string, id: string, userId: string, confirmBookingDto: ConfirmBookingDto): Promise<BookingResponseDto> {
    const booking = await this.findById(tenantId, id);

    if (booking.status !== BookingStatus.REQUESTED && booking.status !== BookingStatus.QUOTED) {
      throw new BadRequestException('Can only confirm requested or quoted bookings');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
        internalNotes: confirmBookingDto.notes ? `${booking.internalNotes || ''}\n${confirmBookingDto.notes}` : booking.internalNotes,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        spaces: {
          include: {
            allocations: { include: { container: true } },
            rate: true,
          },
        },
        customer: true,
        supplier: true,
        carrier: true,
        vessel: true,
        voyage: true,
      },
    });

    await this.publishEvent(EventTypes.BOOKING.CONFIRMED, updatedBooking);

    return this.mapToResponse(updatedBooking);
  }

  async cancel(tenantId: string, id: string, userId: string, cancelBookingDto: CancelBookingDto): Promise<BookingResponseDto> {
    const booking = await this.findById(tenantId, id);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.EXPIRED) {
      throw new BadRequestException('Cannot cancel completed or expired booking');
    }

    // Release allocated spaces
    await this.prisma.bookingSpace.updateMany({
      where: { bookingId: id, status: SpaceStatus.ALLOCATED },
      data: { status: SpaceStatus.RELEASED, releasedAt: new Date() },
    });

    await this.prisma.spaceAllocation.updateMany({
      where: { bookingId: id, status: 'ALLOCATED' },
      data: { status: 'RELEASED', releasedAt: new Date() },
    );

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: cancelBookingDto.reason,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        spaces: {
          include: {
            allocations: { include: { container: true } },
            rate: true,
          },
        },
        customer: true,
        supplier: true,
        carrier: true,
        vessel: true,
        voyage: true,
      },
    });

    await this.publishEvent(EventTypes.BOOKING.CANCELLED, updatedBooking);

    return this.mapToResponse(updatedBooking);
  }

  async amend(tenantId: string, id: string, userId: string, amendBookingDto: AmendBookingDto): Promise<BookingResponseDto> {
    const booking = await this.findById(tenantId, id);

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.EXPIRED) {
      throw new BadRequestException('Cannot amend cancelled or expired booking');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        code: amendBookingDto.newCode || booking.code,
        status: amendBookingDto.newStatus || BookingStatus.AMENDED,
        internalNotes: amendBookingDto.reason ? `${booking.internalNotes || ''}\nAmendment: ${amendBookingDto.reason}` : booking.internalNotes,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        spaces: {
          include: {
            allocations: { include: { container: true } },
            rate: true,
          },
        },
        customer: true,
        supplier: true,
        carrier: true,
        vessel: true,
        voyage: true,
      },
    });

    await this.publishEvent(EventTypes.BOOKING.AMENDED, updatedBooking);

    return this.mapToResponse(updatedBooking);
  }

  async split(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    id: string,
    body: { newCode: string; spaces: Array<{ containerType: string; containerCount: number }> },
  ): Promise<BookingResponseDto> {
    const booking = await this.findById(tenantId, id);

    if (booking.status !== BookingStatus.BOOKED && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Can only split booked or confirmed bookings');
    }

    const existingBooking = await this.prisma.booking.findUnique({
      where: { code_tenantId: { code: body.newCode, tenantId } },
    });

    if (existingBooking) {
      throw new ConflictException('Booking code already exists');
    }

    const newBooking = await this.prisma.$transaction(async (tx) => {
      const splitBooking = await tx.booking.create({
        data: {
          code: body.newCode,
          reference: booking.reference,
          type: booking.type,
          status: BookingStatus.REQUESTED,
          mode: booking.mode,
          direction: booking.direction,
          incoterm: booking.incoterm,
          currency: booking.currency,
          exchangeRate: booking.exchangeRate,
          customerId: booking.customerId,
          supplierId: booking.supplierId,
          carrierId: booking.carrierId,
          vesselId: booking.vesselId,
          voyageId: booking.voyageId,
          jobId: booking.jobId,
          shipmentId: booking.shipmentId,
          origin: booking.origin,
          destination: booking.destination,
          pol: booking.pol,
          pod: booking.pod,
          finalDestination: booking.finalDestination,
          commodity: booking.commodity,
          weight: booking.weight,
          volume: booking.volume,
          quantity: booking.quantity,
          unit: booking.unit,
          value: booking.value,
          insuranceValue: booking.insuranceValue,
          hazardousClass: booking.hazardousClass,
          unNumber: booking.unNumber,
          imdgClass: booking.imdgClass,
          packingGroup: booking.packingGroup,
          pickupDate: booking.pickupDate,
          deliveryDate: booking.deliveryDate,
          cutoffDate: booking.cutoffDate,
          etd: booking.etd,
          eta: booking.eta,
          notes: booking.notes,
          internalNotes: `Split from ${booking.code}`,
          terms: booking.terms,
          tenantId,
          branchId,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      for (const space of body.spaces) {
        await tx.bookingSpace.create({
          data: {
            bookingId: splitBooking.id,
            containerType: space.containerType as any,
            containerCount: space.containerCount,
            status: SpaceStatus.REQUESTED,
            tenantId,
          },
        });
      }

      return splitBooking;
    });

    await this.publishEvent(EventTypes.BOOKING.SPLIT, {
      ...newBooking,
      parentBookingId: booking.id,
    });

    return this.findById(tenantId, newBooking.id);
  }

  async roll(tenantId: string, id: string, userId: string, body: { newVoyageId: string; reason?: string }): Promise<BookingResponseDto> {
    const booking = await this.findById(tenantId, id);

    if (booking.status !== BookingStatus.BOOKED && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Can only roll booked or confirmed bookings');
    }

    const newVoyage = await this.prisma.voyage.findFirst({
      where: { id: body.newVoyageId, tenantId, isDeleted: false },
    });

    if (!newVoyage) {
      throw new NotFoundException('New voyage not found');
    }

    if (newVoyage.status !== 'SCHEDULED' && newVoyage.status !== 'IN_PROGRESS') {
      throw new BadRequestException('New voyage is not available for booking');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        voyageId: body.newVoyageId,
        etd: newVoyage.etd,
        eta: newVoyage.eta,
        status: BookingStatus.ROLLED,
        internalNotes: body.reason ? `${booking.internalNotes || ''}\nRolled to ${newVoyage.code}: ${body.reason}` : `${booking.internalNotes || ''}\nRolled to ${newVoyage.code}`,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        spaces: {
          include: {
            allocations: { include: { container: true } },
            rate: true,
          },
        },
        customer: true,
        supplier: true,
        carrier: true,
        vessel: true,
        voyage: true,
      },
    });

    await this.publishEvent(EventTypes.BOOKING.ROLLED, {
      ...updatedBooking,
      previousVoyageId: booking.voyageId,
    });

    return this.mapToResponse(updatedBooking);
  }

  async hold(tenantId: string, id: string, userId: string, reason: string): Promise<BookingResponseDto> {
    const booking = await this.findById(tenantId, id);

    if (booking.status === BookingStatus.ON_HOLD) {
      throw new BadRequestException('Booking already on hold');
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.EXPIRED || booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot hold cancelled, expired, or completed booking');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.ON_HOLD,
        internalNotes: `${booking.internalNotes || ''}\nOn hold: ${reason}`,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        spaces: {
          include: {
            allocations: { include: { container: true } },
            rate: true,
          },
        },
        customer: true,
        supplier: true,
        carrier: true,
        vessel: true,
        voyage: true,
      },
    });

    return this.mapToResponse(updatedBooking);
  }

  async release(tenantId: string, id: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.findById(tenantId, id);

    if (booking.status !== BookingStatus.ON_HOLD) {
      throw new BadRequestException('Booking is not on hold');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.BOOKED,
        internalNotes: `${booking.internalNotes || ''}\nReleased from hold`,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        spaces: {
          include: {
            allocations: { include: { container: true } },
            rate: true,
          },
        },
        customer: true,
        supplier: true,
        carrier: true,
        vessel: true,
        voyage: true,
      },
    });

    return this.mapToResponse(updatedBooking);
  }

  async getStats(tenantId: string, branchId: string | undefined): Promise<any> {
    const where: Prisma.BookingWhereInput = { tenantId, isDeleted: false };
    if (branchId) where.branchId = branchId;

    const [total, byStatus, byType, byCarrier, confirmedThisMonth] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.groupBy({ by: ['status'], where, _count: { status: true } }),
      this.prisma.booking.groupBy({ by: ['type'], where, _count: { type: true } }),
      this.prisma.booking.groupBy({ by: ['carrierId'], where, _count: { carrierId: true }, take: 10, orderBy: { _count: { carrierId: 'desc' } } }),
      this.prisma.booking.count({
        where: {
          ...where,
          status: { in: [BookingStatus.BOOKED, BookingStatus.CONFIRMED] },
          confirmedAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
    ]);

    const carrierDetails = await Promise.all(
      byCarrier.map(async (c) => {
        const carrier = await this.prisma.carrier.findUnique({ where: { id: c.carrierId } });
        return { carrierId: c.carrierId, carrierName: carrier?.name, count: c._count.carrierId };
      })
    );

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item._count.status }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item._count.type }), {}),
      topCarriers: carrierDetails,
      confirmedThisMonth,
    };
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'BOOKING',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish booking event:', error);
    }
  }

  private mapToResponse(booking: Booking & {
    spaces?: any[];
    customer?: any;
    supplier?: any;
    carrier?: any;
    vessel?: any;
    voyage?: any;
    job?: any;
    shipment?: any;
    _count?: any;
  }): BookingResponseDto {
    return {
      id: booking.id,
      code: booking.code,
      reference: booking.reference,
      type: booking.type,
      status: booking.status,
      mode: booking.mode,
      direction: booking.direction,
      incoterm: booking.incoterm,
      currency: booking.currency,
      exchangeRate: booking.exchangeRate.toNumber(),
      customerId: booking.customerId,
      supplierId: booking.supplierId,
      carrierId: booking.carrierId,
      vesselId: booking.vesselId,
      voyageId: booking.voyageId,
      jobId: booking.jobId,
      shipmentId: booking.shipmentId,
      origin: booking.origin,
      destination: booking.destination,
      pol: booking.pol,
      pod: booking.pod,
      finalDestination: booking.finalDestination,
      commodity: booking.commodity,
      weight: booking.weight?.toNumber(),
      volume: booking.volume?.toNumber(),
      quantity: booking.quantity,
      unit: booking.unit,
      value: booking.value?.toNumber(),
      insuranceValue: booking.insuranceValue?.toNumber(),
      hazardousClass: booking.hazardousClass,
      unNumber: booking.unNumber,
      imdgClass: booking.imdgClass,
      packingGroup: booking.packingGroup,
      pickupDate: booking.pickupDate,
      deliveryDate: booking.deliveryDate,
      cutoffDate: booking.cutoffDate,
      etd: booking.etd,
      eta: booking.eta,
      atd: booking.atd,
      ata: booking.ata,
      confirmedAt: booking.confirmedAt,
      cancelledAt: booking.cancelledAt,
      cancelReason: booking.cancelReason,
      notes: booking.notes,
      internalNotes: booking.internalNotes,
      terms: booking.terms,
      spaces: booking.spaces?.map(space => ({
        id: space.id,
        containerType: space.containerType,
        containerCount: space.containerCount,
        weightLimit: space.weightLimit?.toNumber(),
        volumeLimit: space.volumeLimit?.toNumber(),
        rateId: space.rateId,
        rateAmount: space.rateAmount?.toNumber(),
        rateCurrency: space.rateCurrency,
        status: space.status,
        allocatedAt: space.allocatedAt,
        releasedAt: space.releasedAt,
        notes: space.notes,
        allocations: space.allocations?.map(alloc => ({
          id: alloc.id,
          bookingSpaceId: alloc.bookingSpaceId,
          containerId: alloc.containerId,
          containerNumber: alloc.containerNumber,
          sealNumber: alloc.sealNumber,
          allocatedAt: alloc.allocatedAt,
          releasedAt: alloc.releasedAt,
          status: alloc.status,
          notes: alloc.notes,
          createdAt: alloc.createdAt,
          updatedAt: alloc.updatedAt,
        })),
        createdAt: space.createdAt,
        updatedAt: space.updatedAt,
      })),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}