import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, ContactQueryDto, ContactResponseDto } from './dto/contact.dto';

@ApiTags('Contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @Permissions('contacts.create')
  @ApiOperation({ summary: 'Create contact' })
  @ApiResponse({ status: 201, description: 'Contact created', type: ContactResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Body() createContactDto: CreateContactDto,
  ) {
    return this.contactsService.create(tenantId, userId, createContactDto);
  }

  @Get()
  @Permissions('contacts.read')
  @ApiOperation({ summary: 'List contacts' })
  @ApiResponse({ status: 200, description: 'Contacts list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() query: ContactQueryDto,
  ) {
    return this.contactsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('contacts.read')
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiResponse({ status: 200, description: 'Contact details', type: ContactResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.contactsService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('contacts.update')
  @ApiOperation({ summary: 'Update contact' })
  @ApiResponse({ status: 200, description: 'Contact updated', type: ContactResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactsService.update(tenantId, id, userId, updateContactDto);
  }

  @Delete(':id')
  @Permissions('contacts.delete')
  @ApiOperation({ summary: 'Delete contact' })
  @ApiResponse({ status: 200, description: 'Contact deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.contactsService.delete(tenantId, id, userId);
    return { message: 'Contact deleted successfully' };
  }

  @Put(':id/set-primary')
  @Permissions('contacts.update')
  @ApiOperation({ summary: 'Set contact as primary' })
  @ApiResponse({ status: 200, description: 'Primary contact updated' })
  async setPrimary(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.contactsService.setPrimary(tenantId, id, userId);
  }
}