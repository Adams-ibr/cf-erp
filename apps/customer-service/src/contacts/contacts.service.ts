import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Contact, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateContactDto, UpdateContactDto, ContactQueryDto, ContactResponseDto } from './dto/contact.dto';
import { PaginatedResult } from '@cf-erp/shared';

@Injectable()
export class ContactsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createContactDto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    if (!createContactDto.customerId && !createContactDto.supplierId) {
      throw new BadRequestException('Contact must belong to either a customer or supplier');
    }

    if (createContactDto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: createContactDto.customerId, tenantId, isDeleted: false },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    if (createContactDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createContactDto.supplierId, tenantId, isDeleted: false },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    if (createContactDto.isPrimary) {
      await this.unsetPrimary(tenantId, createContactDto.customerId, createContactDto.supplierId);
    }

    const contact = await this.prisma.contact.create({
      data: {
        ...createContactDto,
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return this.mapToResponse(contact);
  }

  async findAll(tenantId: string, query: ContactQueryDto): Promise<PaginatedResult<ContactResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ContactWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.isPrimary !== undefined) {
      where.isPrimary = query.isPrimary;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data: contacts.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<ContactResponseDto> {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId, isDeleted: false },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return this.mapToResponse(contact);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateContactDto: UpdateContactDto,
  ): Promise<ContactResponseDto> {
    const contact = await this.findById(tenantId, id);

    if (updateContactDto.isPrimary && !contact.isPrimary) {
      await this.unsetPrimary(tenantId, contact.customerId, contact.supplierId);
    }

    const updatedContact = await this.prisma.contact.update({
      where: { id },
      data: {
        ...updateContactDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedContact);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    await this.findById(tenantId, id);

    await this.prisma.contact.update({
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

  async setPrimary(tenantId: string, id: string, userId: string): Promise<ContactResponseDto> {
    const contact = await this.findById(tenantId, id);

    await this.unsetPrimary(tenantId, contact.customerId, contact.supplierId);

    const updatedContact = await this.prisma.contact.update({
      where: { id },
      data: {
        isPrimary: true,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedContact);
  }

  private async unsetPrimary(
    tenantId: string,
    customerId: string | null,
    supplierId: string | null,
  ): Promise<void> {
    const where: Prisma.ContactWhereInput = {
      tenantId,
      isDeleted: false,
      isPrimary: true,
    };

    if (customerId) {
      where.customerId = customerId;
    } else if (supplierId) {
      where.supplierId = supplierId;
    }

    await this.prisma.contact.updateMany({
      where,
      data: { isPrimary: false },
    });
  }

  private mapToResponse(contact: Contact): ContactResponseDto {
    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      title: contact.title,
      department: contact.department,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      fax: contact.fax,
      isPrimary: contact.isPrimary,
      isActive: contact.isActive,
      customerId: contact.customerId,
      supplierId: contact.supplierId,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }
}