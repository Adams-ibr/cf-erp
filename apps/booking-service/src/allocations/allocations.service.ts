import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, SpaceAllocation, AllocationStatus, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateAllocationDto, AllocationQueryDto, AllocationResponseDto } from './dto/allocation.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class AllocationsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    bookingId: string,
    spaceId: string,
    userId: string,
    createAllocationDto: CreateAllocationDto,
  ): Promise<AllocationResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId, isDeleted: false },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const space = await this.prisma.bookingSpace.findFirst({
      where: { id: spaceId, bookingId, tenantId },
    });
    if (!space) {
      throw new NotFoundException('Booking space not found');
    }

    if (space.status !== 'REQUESTED' && space.status !== 'CONFIRMED') {
      throw new BadRequestException('Space must be requested or confirmed for allocation');
    }

    const container = await this.prisma.container.findFirst({
      where: { id: createAllocationDto.containerId, tenantId, isDeleted: false },
    });
    if (!container) {
      throw new NotFoundException('Container not found');
    }

    if (container.status !== 'AVAILABLE') {
      throw new BadRequestException('Container is not available for allocation');
    }

    const existingAllocation = await this.prisma.spaceAllocation.findFirst({
      where: { containerId: createAllocationDto.containerId, status: 'ALLOCATED' },
    });
    if (existingAllocation) {
      throw new ConflictException('Container already allocated');
    }

    const allocatedCount = await this.prisma.spaceAllocation.count({
      where: { bookingSpaceId: spaceId, status: 'ALLOCATED' },
    });

    if (allocatedCount >= space.containerCount) {
      throw new BadRequestException('Space is fully allocated');
    }

    const allocation = await this.prisma.$transaction(async (tx) => {
      const newAllocation = await tx.spaceAllocation.create({
        data: {
          bookingId,
          bookingSpaceId: spaceId,
          containerId: createAllocationDto.containerId,
          containerNumber: container.number,
          sealNumber: createAllocationDto.sealNumber,
          status: AllocationStatus.ALLOCATED,
          notes: createAllocationDto.notes,
          tenantId,
        },
        include: { container: true },
      });

      await tx.container.update({
        where: { id: createAllocationDto.containerId },
        data: { status: 'BOOKED' },
      });

      if (allocatedCount + 1 >= space.containerCount) {
        await tx.bookingSpace.update({
          where: { id: spaceId },
          data: { status: 'ALLOCATED', allocatedAt: new Date() },
        });
      }

      return newAllocation;
    });

    return this.mapToResponse(allocation);
  }

  async findAll(
    tenantId: string,
    bookingId: string,
    spaceId: string,
    query: AllocationQueryDto,
  ): Promise<PaginatedResult<AllocationResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.SpaceAllocationWhereInput = {
      bookingId,
      bookingSpaceId: spaceId,
      tenantId,
    };

    if (query.status) {
      where.status = query.status as AllocationStatus;
    }

    if (query.containerId) {
      where.containerId = query.containerId;
    }

    const orderBy = { allocatedAt: 'desc' };

    const [allocations, total] = await Promise.all([
      this.prisma.spaceAllocation.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { container: true },
      }),
      this.prisma.spaceAllocation.count({ where }),
    ]);

    return {
      data: allocations.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, bookingId: string, spaceId: string, id: string): Promise<AllocationResponseDto> {
    const allocation = await this.prisma.spaceAllocation.findFirst({
      where: { id, bookingId, bookingSpaceId: spaceId, tenantId },
      include: { container: true },
    });

    if (!allocation) {
      throw new NotFoundException('Allocation not found');
    }

    return this.mapToResponse(allocation);
  }

  async release(
    tenantId: string,
    bookingId: string,
    spaceId: string,
    id: string,
    userId: string,
    body: { sealNumber?: string; notes?: string },
  ): Promise<AllocationResponseDto> {
    const allocation = await this.findById(tenantId, bookingId, spaceId, id);

    if (allocation.status !== AllocationStatus.ALLOCATED) {
      throw new BadRequestException('Can only release allocated containers');
    }

    const updatedAllocation = await this.prisma.$transaction(async (tx) => {
      const released = await tx.spaceAllocation.update({
        where: { id },
        data: {
          status: AllocationStatus.RELEASED,
          releasedAt: new Date(),
          sealNumber: body.sealNumber ?? allocation.sealNumber,
          notes: body.notes ? `${allocation.notes || ''}\n${body.notes}` : allocation.notes,
        },
        include: { container: true },
      });

      await tx.container.update({
        where: { id: allocation.containerId },
        data: { status: 'AVAILABLE' },
      });

      const remainingAllocated = await tx.spaceAllocation.count({
        where: { bookingSpaceId: spaceId, status: 'ALLOCATED' },
      });

      if (remainingAllocated === 0) {
        await tx.bookingSpace.update({
          where: { id: spaceId },
          data: { status: 'CONFIRMED', allocatedAt: null },
        });
      }

      return released;
    });

    return this.mapToResponse(updatedAllocation);
  }

  async cancel(tenantId: string, bookingId: string, spaceId: string, id: string, userId: string): Promise<void> {
    const allocation = await this.findById(tenantId, bookingId, spaceId, id);

    if (allocation.status === AllocationStatus.CANCELLED) {
      throw new BadRequestException('Allocation already cancelled');
    }

    if (allocation.status === AllocationStatus.RELEASED) {
      throw new BadRequestException('Cannot cancel released allocation');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.spaceAllocation.update({
        where: { id },
        data: { status: AllocationStatus.CANCELLED },
      });

      if (allocation.status === AllocationStatus.ALLOCATED) {
        await tx.container.update({
          where: { id: allocation.containerId },
          data: { status: 'AVAILABLE' },
        });

        const remainingAllocated = await tx.spaceAllocation.count({
          where: { bookingSpaceId: spaceId, status: 'ALLOCATED' },
        });

        if (remainingAllocated === 0) {
          await tx.bookingSpace.update({
            where: { id: spaceId },
            data: { status: 'CONFIRMED', allocatedAt: null },
          });
        }
      }
    });
  }

  private mapToResponse(allocation: SpaceAllocation & { container?: any }): AllocationResponseDto {
    return {
      id: allocation.id,
      bookingId: allocation.bookingId,
      bookingSpaceId: allocation.bookingSpaceId,
      containerId: allocation.containerId,
      containerNumber: allocation.containerNumber,
      sealNumber: allocation.sealNumber,
      allocatedAt: allocation.allocatedAt,
      releasedAt: allocation.releasedAt,
      status: allocation.status,
      notes: allocation.notes,
      createdAt: allocation.createdAt,
      updatedAt: allocation.updatedAt,
    };
  }
}