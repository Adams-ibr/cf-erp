import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, Vessel, VesselType, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateVesselDto, UpdateVesselDto, VesselQueryDto, VesselResponseDto } from './dto/vessel.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class VesselsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createVesselDto: CreateVesselDto,
  ): Promise<VesselResponseDto> {
    const existingVessel = await this.prisma.vessel.findUnique({
      where: { code_tenantId: { code: createVesselDto.code, tenantId } },
    });

    if (existingVessel) {
      throw new ConflictException('Vessel code already exists in this tenant');
    }

    if (createVesselDto.imo) {
      const existingImo = await this.prisma.vessel.findUnique({
        where: { imo_tenantId: { imo: createVesselDto.imo, tenantId } },
      });
      if (existingImo) {
        throw new ConflictException('IMO already exists in this tenant');
      }
    }

    if (createVesselDto.carrierId) {
      const carrier = await this.prisma.carrier.findFirst({
        where: { id: createVesselDto.carrierId, tenantId, isDeleted: false },
      });
      if (!carrier) {
        throw new NotFoundException('Carrier not found');
      }
    }

    const vessel = await this.prisma.vessel.create({
      data: {
        code: createVesselDto.code,
        name: createVesselDto.name,
        imo: createVesselDto.imo,
        mmsi: createVesselDto.mmsi,
        callSign: createVesselDto.callSign,
        flag: createVesselDto.flag,
        type: createVesselDto.type,
        capacity: createVesselDto.capacity,
        dwt: createVesselDto.dwt,
        loa: createVesselDto.loa ? new Prisma.Decimal(createVesselDto.loa) : null,
        beam: createVesselDto.beam ? new Prisma.Decimal(createVesselDto.beam) : null,
        draft: createVesselDto.draft ? new Prisma.Decimal(createVesselDto.draft) : null,
        yearBuilt: createVesselDto.yearBuilt,
        builder: createVesselDto.builder,
        owner: createVesselDto.owner,
        operator: createVesselDto.operator,
        carrierId: createVesselDto.carrierId,
        isActive: createVesselDto.isActive ?? true,
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.publishEvent('vessel.created', vessel);

    return this.mapToResponse(vessel);
  }

  async findAll(
    tenantId: string,
    query: VesselQueryDto,
  ): Promise<PaginatedResult<VesselResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.VesselWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (query.type) {
      where.type = query.type as VesselType;
    }

    if (query.carrierId) {
      where.carrierId = query.carrierId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.imo) {
      where.imo = query.imo;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { imo: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { name: 'asc' };

    const [vessels, total] = await Promise.all([
      this.prisma.vessel.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          carrier: true,
          voyages: { where: { isDeleted: false }, take: 10 },
        },
      }),
      this.prisma.vessel.count({ where }),
    ]);

    return {
      data: vessels.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<VesselResponseDto> {
    const vessel = await this.prisma.vessel.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        carrier: true,
        voyages: { where: { isDeleted: false, isActive: true }, take: 20 },
      },
    });

    if (!vessel) {
      throw new NotFoundException('Vessel not found');
    }

    return this.mapToResponse(vessel);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateVesselDto: UpdateVesselDto,
  ): Promise<VesselResponseDto> {
    const vessel = await this.findById(tenantId, id);

    if (updateVesselDto.imo && updateVesselDto.imo !== vessel.imo) {
      const existingImo = await this.prisma.vessel.findUnique({
        where: { imo_tenantId: { imo: updateVesselDto.imo, tenantId } },
      });
      if (existingImo) {
        throw new ConflictException('IMO already exists in this tenant');
      }
    }

    if (updateVesselDto.carrierId && updateVesselDto.carrierId !== vessel.carrierId) {
      const carrier = await this.prisma.carrier.findFirst({
        where: { id: updateVesselDto.carrierId, tenantId, isDeleted: false },
      });
      if (!carrier) {
        throw new NotFoundException('Carrier not found');
      }
    }

    const updatedVessel = await this.prisma.vessel.update({
      where: { id },
      data: {
        ...updateVesselDto,
        loa: updateVesselDto.loa ? new Prisma.Decimal(updateVesselDto.loa) : undefined,
        beam: updateVesselDto.beam ? new Prisma.Decimal(updateVesselDto.beam) : undefined,
        draft: updateVesselDto.draft ? new Prisma.Decimal(updateVesselDto.draft) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        carrier: true,
        voyages: { where: { isDeleted: false, isActive: true }, take: 10 },
      },
    });

    await this.publishEvent('vessel.updated', updatedVessel);

    return this.mapToResponse(updatedVessel);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const vessel = await this.findById(tenantId, id);

    const voyages = await this.prisma.voyage.count({
      where: { vesselId: id, isDeleted: false },
    });

    if (voyages > 0) {
      throw new ConflictException('Cannot delete vessel with associated voyages');
    }

    await this.prisma.vessel.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('vessel.deleted', { id, tenantId });
  }

  async setActive(tenantId: string, id: string, userId: string, isActive: boolean): Promise<VesselResponseDto> {
    const vessel = await this.findById(tenantId, id);

    const updatedVessel = await this.prisma.vessel.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedVessel);
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'VESSEL',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish vessel event:', error);
    }
  }

  private mapToResponse(vessel: Vessel & { carrier?: any; voyages?: any[] }): VesselResponseDto {
    return {
      id: vessel.id,
      code: vessel.code,
      name: vessel.name,
      imo: vessel.imo,
      mmsi: vessel.mmsi,
      callSign: vessel.callSign,
      flag: vessel.flag,
      type: vessel.type,
      capacity: vessel.capacity,
      dwt: vessel.dwt,
      loa: vessel.loa?.toNumber(),
      beam: vessel.beam?.toNumber(),
      draft: vessel.draft?.toNumber(),
      yearBuilt: vessel.yearBuilt,
      builder: vessel.builder,
      owner: vessel.owner,
      operator: vessel.operator,
      carrierId: vessel.carrierId,
      isActive: vessel.isActive,
      createdAt: vessel.createdAt,
      updatedAt: vessel.updatedAt,
    };
  }
}