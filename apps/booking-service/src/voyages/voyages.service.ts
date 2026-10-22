import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Voyage, VoyageStatus, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateVoyageDto, UpdateVoyageDto, AddScheduleDto, VoyageQueryDto, VoyageResponseDto } from './dto/voyage.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class VoyagesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createVoyageDto: CreateVoyageDto,
  ): Promise<VoyageResponseDto> {
    const existingVoyage = await this.prisma.voyage.findUnique({
      where: { code_tenantId: { code: createVoyageDto.code, tenantId } },
    });

    if (existingVoyage) {
      throw new ConflictException('Voyage code already exists in this tenant');
    }

    const vessel = await this.prisma.vessel.findFirst({
      where: { id: createVoyageDto.vesselId, tenantId, isDeleted: false },
    });
    if (!vessel) {
      throw new NotFoundException('Vessel not found');
    }

    if (createVoyageDto.carrierId) {
      const carrier = await this.prisma.carrier.findFirst({
        where: { id: createVoyageDto.carrierId, tenantId, isDeleted: false },
      });
      if (!carrier) {
        throw new NotFoundException('Carrier not found');
      }
    }

    if (createVoyageDto.etd >= createVoyageDto.eta) {
      throw new BadRequestException('ETD must be before ETA');
    }

    const voyage = await this.prisma.$transaction(async (tx) => {
      const newVoyage = await tx.voyage.create({
        data: {
          code: createVoyageDto.code,
          name: createVoyageDto.name,
          serviceCode: createVoyageDto.serviceCode,
          vesselId: createVoyageDto.vesselId,
          carrierId: createVoyageDto.carrierId,
          pol: createVoyageDto.pol,
          pod: createVoyageDto.pod,
          etd: createVoyageDto.etd,
          eta: createVoyageDto.eta,
          cutoffDate: createVoyageDto.cutoffDate,
          docsCutoff: createVoyageDto.docsCutoff,
          vgmCutoff: createVoyageDto.vgmCutoff,
          status: VoyageStatus.SCHEDULED,
          isActive: createVoyageDto.isActive ?? true,
          tenantId,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      if (createVoyageDto.schedules && createVoyageDto.schedules.length > 0) {
        await tx.voyageSchedule.createMany({
          data: createVoyageDto.schedules.map(schedule => ({
            voyageId: newVoyage.id,
            portCode: schedule.portCode,
            portName: schedule.portName,
            sequence: schedule.sequence,
            etd: schedule.etd,
            eta: schedule.eta,
            isTransshipment: schedule.isTransshipment || false,
            notes: schedule.notes,
            tenantId,
          })),
        });
      }

      return newVoyage;
    });

    await this.publishEvent('voyage.created', voyage);

    return this.findById(tenantId, voyage.id);
  }

  async findAll(
    tenantId: string,
    query: VoyageQueryDto,
  ): Promise<PaginatedResult<VoyageResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.VoyageWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (query.status) {
      where.status = query.status as VoyageStatus;
    }

    if (query.vesselId) {
      where.vesselId = query.vesselId;
    }

    if (query.carrierId) {
      where.carrierId = query.carrierId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.pol) {
      where.pol = query.pol;
    }

    if (query.pod) {
      where.pod = query.pod;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { etd: 'asc' };

    const [voyages, total] = await Promise.all([
      this.prisma.voyage.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          vessel: true,
          carrier: true,
          schedules: { orderBy: { sequence: 'asc' } },
          _count: { select: { bookings: true } },
        },
      }),
      this.prisma.voyage.count({ where }),
    ]);

    return {
      data: voyages.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<VoyageResponseDto> {
    const voyage = await this.prisma.voyage.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        vessel: true,
        carrier: true,
        schedules: { orderBy: { sequence: 'asc' } },
        bookings: { where: { isDeleted: false }, take: 10 },
      },
    });

    if (!voyage) {
      throw new NotFoundException('Voyage not found');
    }

    return this.mapToResponse(voyage);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateVoyageDto: UpdateVoyageDto,
  ): Promise<VoyageResponseDto> {
    const voyage = await this.findById(tenantId, id);

    if (updateVoyageDto.vesselId && updateVoyageDto.vesselId !== voyage.vesselId) {
      const vessel = await this.prisma.vessel.findFirst({
        where: { id: updateVoyageDto.vesselId, tenantId, isDeleted: false },
      });
      if (!vessel) {
        throw new NotFoundException('Vessel not found');
      }
    }

    if (updateVoyageDto.carrierId && updateVoyageDto.carrierId !== voyage.carrierId) {
      const carrier = await this.prisma.carrier.findFirst({
        where: { id: updateVoyageDto.carrierId, tenantId, isDeleted: false },
      });
      if (!carrier) {
        throw new NotFoundException('Carrier not found');
      }
    }

    if (updateVoyageDto.etd && updateVoyageDto.eta) {
      if (updateVoyageDto.etd >= updateVoyageDto.eta) {
        throw new BadRequestException('ETD must be before ETA');
      }
    }

    const updatedVoyage = await this.prisma.voyage.update({
      where: { id },
      data: {
        ...updateVoyageDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        vessel: true,
        carrier: true,
        schedules: { orderBy: { sequence: 'asc' } },
      },
    });

    await this.publishEvent('voyage.updated', updatedVoyage);

    return this.mapToResponse(updatedVoyage);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const voyage = await this.findById(tenantId, id);

    const bookings = await this.prisma.booking.count({
      where: { voyageId: id, isDeleted: false },
    });

    if (bookings > 0) {
      throw new ConflictException('Cannot delete voyage with associated bookings');
    }

    await this.prisma.voyage.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('voyage.deleted', { id, tenantId });
  }

  async addSchedule(
    tenantId: string,
    voyageId: string,
    userId: string,
    addScheduleDto: AddScheduleDto,
  ): Promise<any> {
    const voyage = await this.findById(tenantId, voyageId);

    if (voyage.status !== VoyageStatus.SCHEDULED) {
      throw new BadRequestException('Can only add schedules to scheduled voyages');
    }

    const existingSchedule = await this.prisma.voyageSchedule.findUnique({
      where: { voyageId_sequence: { voyageId, sequence: addScheduleDto.sequence } },
    });

    if (existingSchedule) {
      throw new ConflictException('Schedule sequence already exists');
    }

    return this.prisma.voyageSchedule.create({
      data: {
        voyageId,
        portCode: addScheduleDto.portCode,
        portName: addScheduleDto.portName,
        sequence: addScheduleDto.sequence,
        etd: addScheduleDto.etd,
        eta: addScheduleDto.eta,
        isTransshipment: addScheduleDto.isTransshipment || false,
        notes: addScheduleDto.notes,
        tenantId,
      },
    });
  }

  async removeSchedule(tenantId: string, voyageId: string, scheduleId: string, userId: string): Promise<void> {
    await this.findById(tenantId, voyageId);

    const schedule = await this.prisma.voyageSchedule.findFirst({
      where: { id: scheduleId, voyageId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    await this.prisma.voyageSchedule.delete({ where: { id: scheduleId } });
  }

  async updateStatus(
    tenantId: string,
    id: string,
    userId: string,
    status: string,
    notes?: string,
  ): Promise<VoyageResponseDto> {
    const voyage = await this.findById(tenantId, id);

    const validStatuses = Object.values(VoyageStatus);
    if (!validStatuses.includes(status as VoyageStatus)) {
      throw new BadRequestException('Invalid status');
    }

    const newStatus = status as VoyageStatus;

    const validTransitions: Record<string, string[]> = {
      SCHEDULED: ['IN_PROGRESS', 'DELAYED', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'DELAYED', 'CANCELLED'],
      DELAYED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: ['SCHEDULED'],
    };

    if (!validTransitions[voyage.status]?.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from ${voyage.status} to ${newStatus}`);
    }

    const updatedVoyage = await this.prisma.voyage.update({
      where: { id },
      data: {
        status: newStatus,
        atd: newStatus === VoyageStatus.IN_PROGRESS && !voyage.atd ? new Date() : voyage.atd,
        ata: newStatus === VoyageStatus.COMPLETED && !voyage.ata ? new Date() : voyage.ata,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        vessel: true,
        carrier: true,
        schedules: { orderBy: { sequence: 'asc' } },
      },
    });

    await this.publishEvent('voyage.status_changed', {
      ...updatedVoyage,
      previousStatus: voyage.status,
    });

    return this.mapToResponse(updatedVoyage);
  }

  async setActive(tenantId: string, id: string, userId: string, isActive: boolean): Promise<VoyageResponseDto> {
    const voyage = await this.findById(tenantId, id);

    const updatedVoyage = await this.prisma.voyage.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedVoyage);
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'VOYAGE',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish voyage event:', error);
    }
  }

  private mapToResponse(voyage: Voyage & { vessel?: any; carrier?: any; schedules?: any[] }): VoyageResponseDto {
    return {
      id: voyage.id,
      code: voyage.code,
      name: voyage.name,
      serviceCode: voyage.serviceCode,
      vesselId: voyage.vesselId,
      carrierId: voyage.carrierId,
      pol: voyage.pol,
      pod: voyage.pod,
      etd: voyage.etd,
      eta: voyage.eta,
      atd: voyage.atd,
      ata: voyage.ata,
      cutoffDate: voyage.cutoffDate,
      docsCutoff: voyage.docsCutoff,
      vgmCutoff: voyage.vgmCutoff,
      status: voyage.status,
      isActive: voyage.isActive,
      schedules: voyage.schedules?.map(s => ({
        id: s.id,
        portCode: s.portCode,
        portName: s.portName,
        sequence: s.sequence,
        etd: s.etd,
        eta: s.eta,
        atd: s.atd,
        ata: s.ata,
        isTransshipment: s.isTransshipment,
        notes: s.notes,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      createdAt: voyage.createdAt,
      updatedAt: voyage.updatedAt,
    };
  }
}