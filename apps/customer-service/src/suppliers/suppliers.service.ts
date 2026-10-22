import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Supplier, SupplierStatus, SupplierType, RiskRating, Incoterm, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto, SupplierResponseDto, CreateContactDto, CreateAddressDto, CreateBankDetailDto } from './dto/supplier.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient, EventTypes } from '@cf-erp/messaging';

@Injectable()
export class SuppliersService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createSupplierDto: CreateSupplierDto,
  ): Promise<SupplierResponseDto> {
    const existingSupplier = await this.prisma.supplier.findUnique({
      where: { code_tenantId: { code: createSupplierDto.code, tenantId } },
    });

    if (existingSupplier) {
      throw new ConflictException('Supplier code already exists in this tenant');
    }

    if (createSupplierDto.taxId) {
      const existingTaxId = await this.prisma.supplier.findFirst({
        where: { taxId: createSupplierDto.taxId, tenantId, isDeleted: false, NOT: { code: createSupplierDto.code } },
      });
      if (existingTaxId) {
        throw new ConflictException('Tax ID already exists');
      }
    }

    if (createSupplierDto.vatNumber) {
      const existingVat = await this.prisma.supplier.findFirst({
        where: { vatNumber: createSupplierDto.vatNumber, tenantId, isDeleted: false, NOT: { code: createSupplierDto.code } },
      });
      if (existingVat) {
        throw new ConflictException('VAT number already exists');
      }
    }

    if (createSupplierDto.parentId) {
      const parent = await this.prisma.supplier.findFirst({
        where: { id: createSupplierDto.parentId, tenantId, isDeleted: false },
      });
      if (!parent) {
        throw new NotFoundException('Parent supplier not found');
      }
    }

    if (createSupplierDto.assignedToId) {
      const assignee = await this.prisma.user.findFirst({
        where: { id: createSupplierDto.assignedToId, tenantId, isActive: true },
      });
      if (!assignee) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    const supplier = await this.prisma.$transaction(async (tx) => {
      const newSupplier = await tx.supplier.create({
        data: {
          code: createSupplierDto.code,
          name: createSupplierDto.name,
          tradeName: createSupplierDto.tradeName,
          type: createSupplierDto.type || SupplierType.COMPANY,
          status: createSupplierDto.status || SupplierStatus.ACTIVE,
          taxId: createSupplierDto.taxId,
          vatNumber: createSupplierDto.vatNumber,
          registrationNumber: createSupplierDto.registrationNumber,
          website: createSupplierDto.website,
          industry: createSupplierDto.industry,
          currency: createSupplierDto.currency || 'USD',
          paymentTerms: createSupplierDto.paymentTerms || 30,
          incoterm: createSupplierDto.incoterm || Incoterm.FOB,
          portOfLoading: createSupplierDto.portOfLoading,
          portOfDischarge: createSupplierDto.portOfDischarge,
          riskRating: createSupplierDto.riskRating || RiskRating.LOW,
          certifications: createSupplierDto.certifications || [],
          notes: createSupplierDto.notes,
          tenantId,
          branchId: createSupplierDto.branchId || branchId,
          assignedToId: createSupplierDto.assignedToId,
          parentId: createSupplierDto.parentId,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      if (createSupplierDto.contacts && createSupplierDto.contacts.length > 0) {
        await tx.contact.createMany({
          data: createSupplierDto.contacts.map((contact, index) => ({
            ...contact,
            supplierId: newSupplier.id,
            tenantId,
            isPrimary: index === 0 || contact.isPrimary,
            createdBy: userId,
            updatedBy: userId,
          })),
        });
      }

      if (createSupplierDto.addresses && createSupplierDto.addresses.length > 0) {
        await tx.address.createMany({
          data: createSupplierDto.addresses.map((address, index) => ({
            ...address,
            supplierId: newSupplier.id,
            tenantId,
            isDefault: index === 0 || address.isDefault,
            createdBy: userId,
            updatedBy: userId,
          })),
        });
      }

      if (createSupplierDto.bankDetails && createSupplierDto.bankDetails.length > 0) {
        await tx.bankDetail.createMany({
          data: createSupplierDto.bankDetails.map((detail, index) => ({
            ...detail,
            supplierId: newSupplier.id,
            tenantId,
            isDefault: index === 0 || detail.isDefault,
            createdBy: userId,
            updatedBy: userId,
          })),
        });
      }

      await tx.activity.create({
        data: {
          type: 'NOTE',
          subject: 'Supplier Created',
          description: `Supplier ${newSupplier.name} (${newSupplier.code}) created`,
          supplierId: newSupplier.id,
          userId,
          tenantId,
        },
      });

      return newSupplier;
    });

    await this.publishEvent(EventTypes.SUPPLIER.CREATED, supplier);

    return this.mapToResponse(supplier);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: SupplierQueryDto,
  ): Promise<PaginatedResult<SupplierResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.status) {
      where.status = query.status as SupplierStatus;
    }

    if (query.type) {
      where.type = query.type as SupplierType;
    }

    if (query.riskRating) {
      where.riskRating = query.riskRating as RiskRating;
    }

    if (query.assignedToId) {
      where.assignedToId = query.assignedToId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { tradeName: { contains: query.search, mode: 'insensitive' } },
        { taxId: { contains: query.search, mode: 'insensitive' } },
        { vatNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          contacts: { where: { isDeleted: false } },
          addresses: { where: { isDeleted: false } },
          bankDetails: { where: { isDeleted: false } },
          _count: { select: { rates: true, bookings: true, shipments: true } },
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<SupplierResponseDto> {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        contacts: { where: { isDeleted: false } },
        addresses: { where: { isDeleted: false } },
        bankDetails: { where: { isDeleted: false } },
        assignedTo: true,
        parent: true,
        children: { where: { isDeleted: false } },
        _count: { select: { rates: true, bookings: true, shipments: true, contacts: true, addresses: true } },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return this.mapToResponse(supplier);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    const supplier = await this.findById(tenantId, id);

    if (updateSupplierDto.taxId && updateSupplierDto.taxId !== supplier.taxId) {
      const existingTaxId = await this.prisma.supplier.findFirst({
        where: { taxId: updateSupplierDto.taxId, tenantId, isDeleted: false, NOT: { id } },
      });
      if (existingTaxId) {
        throw new ConflictException('Tax ID already exists');
      }
    }

    if (updateSupplierDto.vatNumber && updateSupplierDto.vatNumber !== supplier.vatNumber) {
      const existingVat = await this.prisma.supplier.findFirst({
        where: { vatNumber: updateSupplierDto.vatNumber, tenantId, isDeleted: false, NOT: { id } },
      });
      if (existingVat) {
        throw new ConflictException('VAT number already exists');
      }
    }

    if (updateSupplierDto.parentId) {
      if (updateSupplierDto.parentId === id) {
        throw new BadRequestException('Supplier cannot be its own parent');
      }
      const parent = await this.prisma.supplier.findFirst({
        where: { id: updateSupplierDto.parentId, tenantId, isDeleted: false },
      });
      if (!parent) {
        throw new NotFoundException('Parent supplier not found');
      }
    }

    if (updateSupplierDto.assignedToId) {
      const assignee = await this.prisma.user.findFirst({
        where: { id: updateSupplierDto.assignedToId, tenantId, isActive: true },
      });
      if (!assignee) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        ...updateSupplierDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        contacts: { where: { isDeleted: false } },
        addresses: { where: { isDeleted: false } },
        bankDetails: { where: { isDeleted: false } },
      },
    });

    await this.publishEvent(EventTypes.SUPPLIER.UPDATED, updatedSupplier);

    return this.mapToResponse(updatedSupplier);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    await this.findById(tenantId, id);

    await this.prisma.supplier.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent(EventTypes.SUPPLIER.DELETED, { id, tenantId });
  }

  async updateStatus(tenantId: string, id: string, userId: string, status: string): Promise<SupplierResponseDto> {
    const supplier = await this.findById(tenantId, id);

    const validStatuses = Object.values(SupplierStatus);
    if (!validStatuses.includes(status as SupplierStatus)) {
      throw new BadRequestException('Invalid status');
    }

    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        status: status as SupplierStatus,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        contacts: { where: { isDeleted: false } },
        addresses: { where: { isDeleted: false } },
        bankDetails: { where: { isDeleted: false } },
      },
    });

    await this.publishEvent(EventTypes.SUPPLIER.UPDATED, {
      ...updatedSupplier,
      previousStatus: supplier.status,
    });

    return this.mapToResponse(updatedSupplier);
  }

  async assign(tenantId: string, id: string, userId: string, assignedToId: string): Promise<SupplierResponseDto> {
    const supplier = await this.findById(tenantId, id);

    const assignee = await this.prisma.user.findFirst({
      where: { id: assignedToId, tenantId, isActive: true },
    });
    if (!assignee) {
      throw new NotFoundException('Assigned user not found');
    }

    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        assignedToId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        contacts: { where: { isDeleted: false } },
        addresses: { where: { isDeleted: false } },
        bankDetails: { where: { isDeleted: false } },
      },
    });

    return this.mapToResponse(updatedSupplier);
  }

  async getStats(tenantId: string, branchId: string | undefined): Promise<any> {
    const where: Prisma.SupplierWhereInput = { tenantId, isDeleted: false };
    if (branchId) where.branchId = branchId;

    const [total, active, inactive, prospect, byType, byRisk] = await Promise.all([
      this.prisma.supplier.count({ where }),
      this.prisma.supplier.count({ where: { ...where, status: SupplierStatus.ACTIVE } }),
      this.prisma.supplier.count({ where: { ...where, status: SupplierStatus.INACTIVE } }),
      this.prisma.supplier.count({ where: { ...where, status: SupplierStatus.PROSPECT } }),
      this.prisma.supplier.groupBy({ by: ['type'], where, _count: { type: true } }),
      this.prisma.supplier.groupBy({ by: ['riskRating'], where, _count: { riskRating: true } }),
    ]);

    return {
      total,
      active,
      inactive,
      prospect,
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item._count.type }), {}),
      byRisk: byRisk.reduce((acc, item) => ({ ...acc, [item.riskRating]: item._count.riskRating }), {}),
    };
  }

  async getActivities(tenantId: string, supplierId: string, page = 1, limit = 20): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const where = { supplierId, tenantId };

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return {
      data: activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async addActivity(
    tenantId: string,
    supplierId: string,
    userId: string,
    body: { type: string; subject: string; description?: string; metadata?: Record<string, unknown> },
  ): Promise<any> {
    await this.findById(tenantId, supplierId);

    return this.prisma.activity.create({
      data: {
        type: body.type as any,
        subject: body.subject,
        description: body.description,
        metadata: body.metadata,
        supplierId,
        userId,
        tenantId,
      },
    });
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'SUPPLIER',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish supplier event:', error);
    }
  }

  private mapToResponse(supplier: Supplier & {
    contacts?: any[];
    addresses?: any[];
    bankDetails?: any[];
    assignedTo?: any;
    parent?: any;
    children?: any[];
    _count?: any;
  }): SupplierResponseDto {
    return {
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
      tradeName: supplier.tradeName,
      type: supplier.type,
      status: supplier.status,
      taxId: supplier.taxId,
      vatNumber: supplier.vatNumber,
      registrationNumber: supplier.registrationNumber,
      website: supplier.website,
      industry: supplier.industry,
      currency: supplier.currency,
      paymentTerms: supplier.paymentTerms,
      incoterm: supplier.incoterm,
      portOfLoading: supplier.portOfLoading,
      portOfDischarge: supplier.portOfDischarge,
      riskRating: supplier.riskRating,
      certifications: supplier.certifications,
      notes: supplier.notes,
      tenantId: supplier.tenantId,
      branchId: supplier.branchId,
      assignedToId: supplier.assignedToId,
      parentId: supplier.parentId,
      contacts: supplier.contacts?.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        title: c.title,
        department: c.department,
        email: c.email,
        phone: c.phone,
        mobile: c.mobile,
        fax: c.fax,
        isPrimary: c.isPrimary,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      addresses: supplier.addresses?.map(a => ({
        id: a.id,
        type: a.type,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        state: a.state,
        postalCode: a.postalCode,
        country: a.country,
        coordinates: a.coordinates,
        isDefault: a.isDefault,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      bankDetails: supplier.bankDetails?.map(b => ({
        id: b.id,
        bankName: b.bankName,
        accountName: b.accountName,
        accountNumber: b.accountNumber,
        iban: b.iban,
        swiftBic: b.swiftBic,
        routingNumber: b.routingNumber,
        branchName: b.branchName,
        branchAddress: b.branchAddress,
        currency: b.currency,
        isDefault: b.isDefault,
        isActive: b.isActive,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    };
  }
}