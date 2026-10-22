import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, TrackingEvent, TrackingEventType, MilestoneType, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateTrackingEventDto, UpdateTrackingEventDto, TrackingEventQueryDto, TrackingEventResponseDto } from './dto/tracking-event.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient, EventTypes } from '@cf-erp/messaging';

@Injectable()
export class TrackingEventsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createTrackingEventDto: CreateTrackingEventDto,
  ): Promise<TrackingEventResponseDto> {
    const existingEvent = await this.prisma.trackingEvent.findUnique({
      where: { code_tenantId: { code: createTrackingEventDto.code, tenantId } },
    });

    if (existingEvent) {
      throw new ConflictException('Tracking event code already exists in this tenant');
    }

    const shipment = await this.prisma.shipment.findFirst({
      where: { id: createTrackingEventDto.shipmentId, tenantId, isDeleted: false },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    if (createTrackingEventDto.vesselId) {
      const vessel = await this.prisma.vessel.findFirst({
        where: { id: createTrackingEventDto.vesselId, tenantId, isDeleted: false },
      });
      if (!vessel) {
        throw new NotFoundException('Vessel not found');
      }
    }

    if (createTrackingEventDto.voyageId) {
      const voyage = await this.prisma.voyage.findFirst({
        where: { id: createTrackingEventDto.voyageId, tenantId, isDeleted: false },
      });
      if (!voyage) {
        throw new NotFoundException('Voyage not found');
      }
    }

    if (createTrackingEventDto.containerId) {
      const container = await this.prisma.container.findFirst({
        where: { id: createTrackingEventDto.containerId, tenantId, isDeleted: false },
      });
      if (!container) {
        throw new NotFoundException('Container not found');
      }
    }

    const event = await this.prisma.trackingEvent.create({
      data: {
        code: createTrackingEventDto.code,
        shipmentId: createTrackingEventDto.shipmentId,
        type: createTrackingEventDto.type,
        status: createTrackingEventDto.status,
        location: createTrackingEventDto.location,
        latitude: createTrackingEventDto.latitude ? new Prisma.Decimal(createTrackingEventDto.latitude) : null,
        longitude: createTrackingEventDto.longitude ? new Prisma.Decimal(createTrackingEventDto.longitude) : null,
        timestamp: createTrackingEventDto.timestamp,
        source: createTrackingEventDto.source,
        sourceReference: createTrackingEventDto.sourceReference,
        vesselId: createTrackingEventDto.vesselId,
        voyageId: createTrackingEventDto.voyageId,
        containerId: createTrackingEventDto.containerId,
        equipmentId: createTrackingEventDto.equipmentId,
        temperature: createTrackingEventDto.temperature ? new Prisma.Decimal(createTrackingEventDto.temperature) : null,
        humidity: createTrackingEventDto.humidity ? new Prisma.Decimal(createTrackingEventDto.humidity) : null,
        details: createTrackingEventDto.details,
        metadata: createTrackingEventDto.metadata,
        isMilestone: createTrackingEventDto.isMilestone ?? false,
        milestoneType: createTrackingEventDto.milestoneType,
        tenantId,
        branchId,
      },
    });

    await this.updateShipmentStatus(tenantId, createTrackingEventDto.shipmentId, createTrackingEventDto.type);

    await this.publishEvent(EventTypes.SHIPMENT.STATUS_CHANGED, event);

    return this.mapToResponse(event);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: TrackingEventQueryDto,
  ): Promise<PaginatedResult<TrackingEventResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TrackingEventWhereInput = {
      tenantId,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.type) {
      where.type = query.type as TrackingEventType;
    }

    if (query.shipmentId) {
      where.shipmentId = query.shipmentId;
    }

    if (query.vesselId) {
      where.vesselId = query.vesselId;
    }

    if (query.voyageId) {
      where.voyageId = query.voyageId;
    }

    if (query.containerId) {
      where.containerId = query.containerId;
    }

    if (query.isMilestone !== undefined) {
      where.isMilestone = query.isMilestone;
    }

    if (query.timestampFrom || query.timestampTo) {
      where.timestamp = {};
      if (query.timestampFrom) where.timestamp.gte = query.timestampFrom;
      if (query.timestampTo) where.timestamp.lte = query.timestampTo;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { status: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { timestamp: 'desc' };

    const [events, total] = await Promise.all([
      this.prisma.trackingEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          shipment: true,
          vessel: true,
          voyage: true,
          container: true,
        },
      }),
      this.prisma.trackingEvent.count({ where }),
    ]);

    return {
      data: events.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByShipment(
    tenantId: string,
    shipmentId: string,
    query: { page?: number; limit?: number; type?: string },
  ): Promise<PaginatedResult<TrackingEventResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TrackingEventWhereInput = {
      tenantId,
      shipmentId,
    };

    if (query.type) {
      where.type = query.type as any;
    }

    const orderBy = { timestamp: 'asc' };

    const [events, total] = await Promise.all([
      this.prisma.trackingEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          vessel: true,
          voyage: true,
          container: true,
        },
      }),
      this.prisma.trackingEvent.count({ where }),
    ]);

    return {
      data: events.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByVessel(
    tenantId: string,
    vesselId: string,
    query: { page?: number; limit?: number; type?: string },
  ): Promise<PaginatedResult<TrackingEventResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TrackingEventWhereInput = {
      tenantId,
      vesselId,
    };

    if (query.type) {
      where.type = query.type as any;
    }

    const orderBy = { timestamp: 'desc' };

    const [events, total] = await Promise.all([
      this.prisma.trackingEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          shipment: true,
          voyage: true,
          container: true,
        },
      }),
      this.prisma.trackingEvent.count({ where }),
    ]);

    return {
      data: events.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByContainer(
    tenantId: string,
    containerId: string,
    query: { page?: number; limit?: number; type?: string },
  ): Promise<PaginatedResult<TrackingEventResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TrackingEventWhereInput = {
      tenantId,
      containerId,
    };

    if (query.type) {
      where.type = query.type as any;
    }

    const orderBy = { timestamp: 'desc' };

    const [events, total] = await Promise.all([
      this.prisma.trackingEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          shipment: true,
          vessel: true,
          voyage: true,
        },
      }),
      this.prisma.trackingEvent.count({ where }),
    ]);

    return {
      data: events.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<TrackingEventResponseDto> {
    const event = await this.prisma.trackingEvent.findFirst({
      where: { id, tenantId },
      include: {
        shipment: true,
        vessel: true,
        voyage: true,
        container: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Tracking event not found');
    }

    return this.mapToResponse(event);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateTrackingEventDto: UpdateTrackingEventDto,
  ): Promise<TrackingEventResponseDto> {
    const event = await this.findById(tenantId, id);

    const updatedEvent = await this.prisma.trackingEvent.update({
      where: { id },
      data: {
        ...updateTrackingEventDto,
        latitude: updateTrackingEventDto.latitude ? new Prisma.Decimal(updateTrackingEventDto.latitude) : undefined,
        longitude: updateTrackingEventDto.longitude ? new Prisma.Decimal(updateTrackingEventDto.longitude) : undefined,
      },
      include: {
        shipment: true,
        vessel: true,
        voyage: true,
        container: true,
      },
    });

    await this.publishEvent('tracking_event.updated', updatedEvent);

    return this.mapToResponse(updatedEvent);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    await this.findById(tenantId, id);

    await this.prisma.trackingEvent.delete({ where: { id } });

    await this.publishEvent('tracking_event.deleted', { id, tenantId });
  }

  async bulkCreate(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    events: CreateTrackingEventDto[],
  ): Promise<TrackingEventResponseDto[]> {
    const createdEvents: TrackingEventResponseDto[] = [];

    for (const eventDto of events) {
      const event = await this.create(tenantId, branchId, userId, eventDto);
      createdEvents.push(event);
    }

    return createdEvents;
  }

  async getStats(tenantId: string, branchId: string | undefined): Promise<any> {
    const where: Prisma.TrackingEventWhereInput = { tenantId };
    if (branchId) where.branchId = branchId;

    const [total, byType, milestones, last24Hours] = await Promise.all([
      this.prisma.trackingEvent.count({ where }),
      this.prisma.trackingEvent.groupBy({ by: ['type'], where, _count: { type: true } }),
      this.prisma.trackingEvent.count({ where: { ...where, isMilestone: true } }),
      this.prisma.trackingEvent.count({
        where: {
          ...where,
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item._count.type }), {}),
      milestones,
      last24Hours,
    };
  }

  private async updateShipmentStatus(tenantId: string, shipmentId: string, eventType: TrackingEventType): Promise<void> {
    const statusMap: Record<string, string> = {
      BOOKING_CONFIRMED: 'BOOKED',
      PICKUP_COMPLETED: 'IN_TRANSIT',
      LOADED_ON_VESSEL: 'LOADED',
      VESSEL_DEPARTED: 'IN_TRANSIT',
      VESSEL_ARRIVED: 'ARRIVED',
      DISCHARGED: 'IN_TRANSIT',
      CUSTOMS_CLEARED: 'CUSTOMS_CLEARED',
      DELIVERY_COMPLETED: 'DELIVERED',
    };

    const newStatus = statusMap[eventType];
    if (newStatus) {
      await this.prisma.shipment.update({
        where: { id: shipmentId, tenantId, isDeleted: false },
        data: { status: newStatus as any },
      });
    }
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'TRACKING_EVENT',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish tracking event:', error);
    }
  }

  private mapToResponse(event: TrackingEvent & { shipment?: any; vessel?: any; voyage?: any; container?: any }): TrackingEventResponseDto {
    return {
      id: event.id,
      code: event.code,
      shipmentId: event.shipmentId,
      type: event.type,
      status: event.status,
      location: event.location,
      latitude: event.latitude?.toNumber(),
      longitude: event.longitude?.toNumber(),
      timestamp: event.timestamp,
      source: event.source,
      sourceReference: event.sourceReference,
      vesselId: event.vesselId,
      voyageId: event.voyageId,
      containerId: event.containerId,
      equipmentId: event.equipmentId,
      temperature: event.temperature?.toNumber(),
      humidity: event.humidity?.toNumber(),
      details: event.details,
      metadata: event.metadata as Record<string, unknown> | undefined,
      isMilestone: event.isMilestone,
      milestoneType: event.milestoneType,
      createdAt: event.createdAt,
    };
  }
}