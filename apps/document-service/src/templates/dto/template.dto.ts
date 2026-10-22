import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean, IsArray, MinLength, MaxLength, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum DocumentType {
  PDF = 'PDF',
  WORD = 'WORD',
  EXCEL = 'EXCEL',
  POWERPOINT = 'POWERPOINT',
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  CSV = 'CSV',
  XML = 'XML',
  JSON = 'JSON',
  ZIP = 'ZIP',
  OTHER = 'OTHER',
}

export enum FieldType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  FILE = 'FILE',
  SIGNATURE = 'SIGNATURE',
  CURRENCY = 'CURRENCY',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  URL = 'URL',
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'TMP-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Commercial Invoice Template' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Standard commercial invoice template' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.PDF })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiPropertyOptional({ example: 'Shipping' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ example: { header: { companyName: 'Company', logo: 'url' }, body: { items: [] }, footer: { terms: 'Terms' } } })
  @IsObject()
  content: Record<string, unknown>;

  @ApiPropertyOptional({ type: () => [CreateTemplateFieldDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateFieldDto)
  fields?: CreateTemplateFieldDto[];
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ example: 'Commercial Invoice Template' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Standard commercial invoice template' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ example: 'Shipping' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: { header: { companyName: 'Company', logo: 'url' }, body: { items: [] }, footer: { terms: 'Terms' } } })
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateTemplateFieldDto {
  @ApiProperty({ example: 'invoiceNumber' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'Invoice Number' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label: string;

  @ApiProperty({ enum: FieldType, example: FieldType.TEXT })
  @IsEnum(FieldType)
  type: FieldType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ example: 'INV-' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  defaultValue?: string;

  @ApiPropertyOptional({ type: [String], example: ['Option 1', 'Option 2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ example: { minLength: 1, maxLength: 20 } })
  @IsOptional()
  @IsObject()
  validation?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class TemplateQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'invoice' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class TemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: DocumentType })
  type: DocumentType;

  @ApiPropertyOptional()
  category?: string;

  @ApiProperty()
  content: Record<string, unknown>;

  @ApiProperty({ type: () => TemplateFieldResponseDto, isArray: true })
  fields: TemplateFieldResponseDto[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  version: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TemplateFieldResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  label: string;

  @ApiProperty({ enum: FieldType })
  type: FieldType;

  @ApiProperty()
  required: boolean;

  @ApiPropertyOptional()
  defaultValue?: string;

  @ApiProperty({ type: [String] })
  options: string[];

  @ApiPropertyOptional()
  validation?: Record<string, unknown>;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}