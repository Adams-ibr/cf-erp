import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Address, AddressType, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateAddressDto, UpdateAddressDto, AddressQueryDto, AddressResponseDto, AddressType as AddressTypeEnum } from './dto/address.dto';
import { PaginatedResult } from '@cf-erp/shared';

@Injectable()
export class AddressesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    if (!createAddressDto.customerId && !createAddressDto.supplierId && !createAddressDto.warehouseId) {
      throw new BadRequestException('Address must belong to a customer, supplier, or warehouse');
    }

    if (createAddressDto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: createAddressDto.customerId, tenantId, isDeleted: false },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    if (createAddressDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createAddressDto.supplierId, tenantId, isDeleted: false },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    if (createAddressDto.warehouseId) {
      const warehouse = await this.prisma.warehouse.findFirst({
        where: { id: createAddressDto.warehouseId, tenantId, isDeleted: false },
      });
      if (!warehouse) {
        throw new NotFoundException('Warehouse not found');
      }
    }

    if (createAddressDto.isDefault) {
      await this.unsetDefault(tenantId, createAddressDto.type, createAddressDto.customerId, createAddressDto.supplierId, createAddressDto.warehouseId);
    }

    const address = await this.prisma.address.create({
      data: {
        ...createAddressDto,
        coordinates: createAddressDto.coordinates ? {
          latitude: parseFloat(createAddressDto.coordinates.latitude),
          longitude: parseFloat(createAddressDto.coordinates.longitude),
        } : null,
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return this.mapToResponse(address);
  }

  async findAll(tenantId: string, query: AddressQueryDto): Promise<PaginatedResult<AddressResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.AddressWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (query.type) {
      where.type = query.type as AddressType;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }

    if (query.isDefault !== undefined) {
      where.isDefault = query.isDefault;
    }

    if (query.country) {
      where.country = query.country;
    }

    if (query.city) {
      where.city = query.city;
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [addresses, total] = await Promise.all([
      this.prisma.address.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.address.count({ where }),
    ]);

    return {
      data: addresses.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<AddressResponseDto> {
    const address = await this.prisma.address.findFirst({
      where: { id, tenantId, isDeleted: false },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.mapToResponse(address);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const address = await this.findById(tenantId, id);

    if (updateAddressDto.isDefault && !address.isDefault) {
      await this.unsetDefault(tenantId, updateAddressDto.type || address.type, address.customerId, address.supplierId, address.warehouseId);
    }

    const updatedAddress = await this.prisma.address.update({
      where: { id },
      data: {
        ...updateAddressDto,
        coordinates: updateAddressDto.coordinates ? {
          latitude: parseFloat(updateAddressDto.coordinates.latitude),
          longitude: parseFloat(updateAddressDto.coordinates.longitude),
        } : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedAddress);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    await this.findById(tenantId, id);

    await this.prisma.address.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async setDefault(tenantId: string, id: string, userId: string): Promise<AddressResponseDto> {
    const address = await this.findById(tenantId, id);

    await this.unsetDefault(tenantId, address.type, address.customerId, address.supplierId, address.warehouseId);

    const updatedAddress = await this.prisma.address.update({
      where: { id },
      data: {
        isDefault: true,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedAddress);
  }

  private async unsetDefault(
    tenantId: string,
    type: AddressType,
    customerId: string | null,
    supplierId: string | null,
    warehouseId: string | null,
  ): Promise<void> {
    const where: Prisma.AddressWhereInput = {
      tenantId,
      isDeleted: false,
      type,
      isDefault: true,
    };

    if (customerId) {
      where.customerId = customerId;
    } else if (supplierId) {
      where.supplierId = supplierId;
    } else if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    await this.prisma.address.updateMany({
      where,
      data: { isDefault: false },
    });
  }

  private mapToResponse(address: Address): AddressResponseDto {
    return {
      id: address.id,
      type: address.type,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      coordinates: address.coordinates as { latitude: number; longitude: number } | undefined,
      isDefault: address.isDefault,
      customerId: address.customerId,
      supplierId: address.supplierId,
      warehouseId: address.warehouseId,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}