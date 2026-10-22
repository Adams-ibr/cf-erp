import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, BookingSpace, SpaceStatus, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateSpaceDto, UpdateSpaceDto, SpaceQueryDto, SpaceResponseDto } from './dto/space.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class SpacesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    bookingId: string,
    userId: string,
    createSpaceDto: CreateSpaceDto,
  ): Promise<SpaceResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId, isDeleted: false },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (createSpaceDto.rateId) {
      const rate = await this.prisma.rate.findFirst({
        where: { id: createSpaceDto.rateId, tenantId, isDeleted: false },
      });
      if (!rate) {
        throw new NotFoundException('Rate not found');
      }
    }

    const space = await this.prisma.bookingSpace.create({
      data: {
        bookingId,
        containerType: createSpaceDto.containerType,
        containerCount: createSpaceDto.containerCount,
        weightLimit: createSpaceDto.weightLimit ? new Prisma.Decimal(createSpaceDto.weightLimit) : null,
        volumeLimit: createSpaceDto.volumeLimit ? new Prisma.Decimal(createSpaceDto.volumeLimit) : null,
        rateId: createSpaceDto.rateId,
        rateAmount: createSpaceDto.rateAmount ? new Prisma.Decimal(createSpaceDto.rateAmount) : null,
        rateCurrency: createSpaceDto.rateCurrency,
        status: SpaceStatus.REQUESTED,
        tenantId,
      },
      include: {
        rate: true,
        allocations: { include: { container: true } },
      },
    });

    return this.mapToResponse(space);
  }

  async findAll(
    tenantId: string,
    bookingId: string,
    query: SpaceQueryDto,
  ): Promise<PaginatedResult<SpaceResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BookingSpaceWhereInput = {
      bookingId,
      tenantId,
    };

    if (query.containerType) {
      where.containerType = query.containerType;
    }

    if (query.status) {
      where.status = query.status as SpaceStatus;
    }

    const orderBy = { createdAt: 'desc' };

    const [spaces, total] = await Promise.all([
      this.prisma.bookingSpace.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          rate: true,
          allocations: { include: { container: true } },
        },
      }),
      this.prisma.bookingSpace.count({ where }),
    ]);

    return {
      data: spaces.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, bookingId: string, id: string): Promise<SpaceResponseDto> {
    const space = await this.prisma.bookingSpace.findFirst({
      where: { id, bookingId, tenantId },
      include: {
        rate: true,
        allocations: { include: { container: true } },
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    return this.mapToResponse(space);
  }

  async update(
    tenantId: string,
    bookingId: string,
    id: string,
    userId: string,
    updateSpaceDto: UpdateSpaceDto,
  ): Promise<SpaceResponseDto> {
    const space = await this.findById(tenantId, bookingId, id);

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId, isDeleted: false },
    });

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      throw new BadRequestException('Cannot update space for cancelled or expired booking');
    }

    if (updateSpaceDto.rateId && updateSpaceDto.rateId !== space.rateId) {
      const rate = await this.prisma.rate.findFirst({
        where: { id: updateSpaceDto.rateId, tenantId, isDeleted: false },
      });
      if (!rate) {
        throw new NotFoundException('Rate not found');
      }
    }

    const updatedSpace = await this.prisma.bookingSpace.update({
      where: { id },
      data: {
        ...updateSpaceDto,
        weightLimit: updateSpaceDto.weightLimit ? new Prisma.Decimal(updateSpaceDto.weightLimit) : undefined,
        volumeLimit: updateSpaceDto.volumeLimit ? new Prisma.Decimal(updateSpaceDto.volumeLimit) : undefined,
        rateAmount: updateSpaceDto.rateAmount ? new Prisma.Decimal(updateSpaceDto.rateAmount) : undefined,
      },
      include: {
        rate: true,
        allocations: { include: { container: true } },
      },
    });

    return this.mapToResponse(updatedSpace);
  }

  async delete(tenantId: string, bookingId: string, id: string, userId: string): Promise<void> {
    const space = await this.findById(tenantId, bookingId, id);

    const allocations = await this.prisma.spaceAllocation.count({
      where: { bookingSpaceId: id, status: 'ALLOCATED' },
    });

    if (allocations > 0) {
      throw new BadRequestException('Cannot delete space with active allocations');
    }

    await this.prisma.bookingSpace.delete({ where: { id } });
  }

  async confirm(tenantId: string, bookingId: string, id: string, userId: string): Promise<SpaceResponseDto> {
    const space = await this.findById(tenantId, bookingId, id);

    if (space.status === SpaceStatus.CONFIRMED || space.status === SpaceStatus.ALLOCATED) {
      throw new BadRequestException('Space already confirmed or allocated');
    }

    if (space.status === SpaceStatus.CANCELLED || space.status === SpaceStatus.RELEASED) {
      throw new BadRequestException('Cannot confirm cancelled or released space');
    }

    const updatedSpace = await this.prisma.bookingSpace.update({
      where: { id },
      data: {
        status: SpaceStatus.CONFIRMED,
        allocatedAt: new Date(),
      },
      include: {
        rate: true,
        allocations: { include: { container: true } },
      },
    });

    return this.mapToResponse(updatedSpace);
  }

  async release(tenantId: string, bookingId: string, id: string, userId: string): Promise<SpaceResponseDto> {
    const space = await this.findById(tenantId, bookingId, id);

    if (space.status !== SpaceStatus.CONFIRMED && space.status !== SpaceStatus.ALLOCATED) {
      throw new BadRequestException('Can only release confirmed or allocated spaces');
    }

    if (space.status === SpaceStatus.ALLOCATED) {
      const activeAllocations = await this.prisma.spaceAllocation.count({
        where: { bookingSpaceId: id, status: 'ALLOCATED' },
      });
      if (activeAllocations > 0) {
        throw new BadRequestException('Cannot release space with active allocations');
      }
    }

    const updatedSpace = await this.prisma.bookingSpace.update({
      where: { id },
      data: {
        status: SpaceStatus.RELEASED,
        releasedAt: new Date(),
      },
      include: {
        rate: true,
        allocations: { include: { container: true } },
      },
    });

    return this.mapToResponse(updatedSpace);
  }

  private mapToResponse(space: BookingSpace & { rate?: any; allocations?: any[] }): SpaceResponseDto {
    return {
      id: space.id,
      bookingId: space.bookingId,
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
    };
  }
}