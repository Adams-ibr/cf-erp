import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Carrier, CarrierType, CarrierService, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateCarrierDto, UpdateCarrierDto, CreateCarrierServiceDto, CarrierQueryDto, CarrierResponseDto } from './dto/carrier.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class CarriersService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createCarrierDto: CreateCarrierDto,
  ): Promise<CarrierResponseDto> {
    const existingCarrier = await this.prisma.carrier.findUnique({
      where: { code_tenantId: { code: createCarrierDto.code, tenantId } },
    });

    if (existingCarrier) {
      throw new ConflictException('Carrier code already exists in this tenant');
    }

    if (createCarrierDto.scac) {
      const existingScac = await this.prisma.carrier.findUnique({
        where: { scac_tenantId: { scac: createCarrierDto.scac, tenantId } },
      });
      if (existingScac) {
        throw new ConflictException('SCAC already exists in this tenant');
      }
    }

    const carrier = await this.prisma.carrier.create({
      data: {
        code: createCarrierDto.code,
        name: createCarrierDto.name,
        type: createCarrierDto.type,
        scac: createCarrierDto.scac,
        mcNumber: createCarrierDto.mcNumber,
        dotNumber: createCarrierDto.dotNumber,
        iataCode: createCarrierDto.iataCode,
        fmcNumber: createCarrierDto.fmcNumber,
        website: createCarrierDto.website,
        email: createCarrierDto.email,
        phone: createCarrierDto.phone,
        address: createCarrierDto.address,
        contactPerson: createCarrierDto.contactPerson,
        contactEmail: createCarrierDto.contactEmail,
        contactPhone: createCarrierDto.contactPhone,
        paymentTerms: createCarrierDto.paymentTerms || 30,
        currency: createCarrierDto.currency || 'USD',
        creditLimit: createCarrierDto.creditLimit ? new Prisma.Decimal(createCarrierDto.creditLimit) : new Prisma.Decimal(0),
        rating: createCarrierDto.rating ? new Prisma.Decimal(createCarrierDto.rating) : null,
        isPreferred: createCarrierDto.isPreferred || false,
        isActive: createCarrierDto.isActive ?? true,
        contractStart: createCarrierDto.contractStart,
        contractEnd: createCarrierDto.contractEnd,
        notes: createCarrierDto.notes,
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.publishEvent('carrier.created', carrier);

    return this.mapToResponse(carrier);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: CarrierQueryDto,
  ): Promise<PaginatedResult<CarrierResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CarrierWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (query.type) {
      where.type = query.type as CarrierType;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.isPreferred !== undefined) {
      where.isPreferred = query.isPreferred;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { scac: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { isPreferred: 'desc', name: 'asc' };

    const [carriers, total] = await Promise.all([
      this.prisma.carrier.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          services: { where: { isActive: true } },
          _count: { select: { bookings: true, vessels: true, voyages: true, rates: true } },
        },
      }),
      this.prisma.carrier.count({ where }),
    ]);

    return {
      data: carriers.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPreferredCarriers(
    tenantId: string,
    query: { mode?: string; origin?: string; destination?: string },
  ): Promise<CarrierResponseDto[]> {
    const where: Prisma.CarrierWhereInput = {
      tenantId,
      isDeleted: false,
      isActive: true,
      isPreferred: true,
    };

    const carriers = await this.prisma.carrier.findMany({
      where,
      include: {
        services: {
          where: { isActive: true },
          take: 5,
        },
      },
    });

    return carriers.map(this.mapToResponse);
  }

  async findById(tenantId: string, id: string): Promise<CarrierResponseDto> {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        services: { where: { isActive: true } },
        vessels: { where: { isDeleted: false, isActive: true } },
        voyages: { where: { isDeleted: false, isActive: true } },
        rates: { where: { isDeleted: false, isActive: true } },
        contacts: { where: { isActive: true } },
        _count: { select: { bookings: true, vessels: true, voyages: true, rates: true, documents: true } },
      },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    return this.mapToResponse(carrier);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateCarrierDto: UpdateCarrierDto,
  ): Promise<CarrierResponseDto> {
    const carrier = await this.findById(tenantId, id);

    if (updateCarrierDto.scac && updateCarrierDto.scac !== carrier.scac) {
      const existingScac = await this.prisma.carrier.findUnique({
        where: { scac_tenantId: { scac: updateCarrierDto.scac, tenantId } },
      });
      if (existingScac) {
        throw new ConflictException('SCAC already exists in this tenant');
      }
    }

    const updatedCarrier = await this.prisma.carrier.update({
      where: { id },
      data: {
        ...updateCarrierDto,
        creditLimit: updateCarrierDto.creditLimit ? new Prisma.Decimal(updateCarrierDto.creditLimit) : undefined,
        rating: updateCarrierDto.rating ? new Prisma.Decimal(updateCarrierDto.rating) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        services: { where: { isActive: true } },
      },
    });

    await this.publishEvent('carrier.updated', updatedCarrier);

    return this.mapToResponse(updatedCarrier);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const carrier = await this.findById(tenantId, id);

    const bookings = await this.prisma.booking.count({
      where: { carrierId: id, isDeleted: false },
    });

    if (bookings > 0) {
      throw new BadRequestException('Cannot delete carrier with associated bookings');
    }

    await this.prisma.carrier.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('carrier.deleted', { id, tenantId });
  }

  async addService(
    tenantId: string,
    carrierId: string,
    userId: string,
    createCarrierServiceDto: CreateCarrierServiceDto,
  ): Promise<CarrierService> {
    const carrier = await this.findById(tenantId, carrierId);

    return this.prisma.carrierService.create({
      data: {
        ...createCarrierServiceDto,
        carrierId,
        equipment: createCarrierServiceDto.equipment || [],
        isActive: createCarrierServiceDto.isActive ?? true,
        tenantId,
      },
    });
  }

  async removeService(tenantId: string, carrierId: string, serviceId: string, userId: string): Promise<void> {
    await this.findById(tenantId, carrierId);

    const service = await this.prisma.carrierService.findFirst({
      where: { id: serviceId, carrierId },
    });

    if (!service) {
      throw new NotFoundException('Carrier service not found');
    }

    await this.prisma.carrierService.delete({ where: { id: serviceId } });
  }

  async setPreferred(tenantId: string, id: string, userId: string, isPreferred: boolean): Promise<CarrierResponseDto> {
    const carrier = await this.findById(tenantId, id);

    const updatedCarrier = await this.prisma.carrier.update({
      where: { id },
      data: {
        isPreferred,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedCarrier);
  }

  async setActive(tenantId: string, id: string, userId: string, isActive: boolean): Promise<CarrierResponseDto> {
    const carrier = await this.findById(tenantId, id);

    const updatedCarrier = await this.prisma.carrier.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedCarrier);
  }

  async getStats(tenantId: string, branchId: string | undefined): Promise<any> {
    const where: Prisma.CarrierWhereInput = { tenantId, isDeleted: false };

    const [total, active, preferred, byType, withBookings] = await Promise.all([
      this.prisma.carrier.count({ where }),
      this.prisma.carrier.count({ where: { ...where, isActive: true } }),
      this.prisma.carrier.count({ where: { ...where, isPreferred: true } }),
      this.prisma.carrier.groupBy({ by: ['type'], where, _count: { type: true } }),
      this.prisma.carrier.count({ where: { ...where, bookings: { some: { isDeleted: false } } } }),
    ]);

    return {
      total,
      active,
      preferred,
      withBookings,
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item._count.type }), {}),
    };
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'CARRIER',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish carrier event:', error);
    }
  }

  private mapToResponse(carrier: Carrier & {
    services?: CarrierService[];
    vessels?: any[];
    voyages?: any[];
    rates?: any[];
    contacts?: any[];
    _count?: any;
  }): CarrierResponseDto {
    return {
      id: carrier.id,
      code: carrier.code,
      name: carrier.name,
      type: carrier.type,
      scac: carrier.scac,
      mcNumber: carrier.mcNumber,
      dotNumber: carrier.dotNumber,
      iataCode: carrier.iataCode,
      fmcNumber: carrier.fmcNumber,
      website: carrier.website,
      email: carrier.email,
      phone: carrier.phone,
      address: carrier.address as Record<string, unknown> | undefined,
      contactPerson: carrier.contactPerson,
      contactEmail: carrier.contactEmail,
      contactPhone: carrier.contactPhone,
      paymentTerms: carrier.paymentTerms,
      currency: carrier.currency,
      creditLimit: carrier.creditLimit.toNumber(),
      rating: carrier.rating?.toNumber(),
      isPreferred: carrier.isPreferred,
      isActive: carrier.isActive,
      contractStart: carrier.contractStart,
      contractEnd: carrier.contractEnd,
      notes: carrier.notes,
      services: carrier.services?.map(s => ({
        id: s.id,
        serviceName: s.serviceName,
        serviceCode: s.serviceCode,
        mode: s.mode,
        origin: s.origin,
        destination: s.destination,
        transitTime: s.transitTime,
        frequency: s.frequency,
        equipment: s.equipment as string[],
        isActive: s.isActive,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      createdAt: carrier.createdAt,
      updatedAt: carrier.updatedAt,
    };
  }
}