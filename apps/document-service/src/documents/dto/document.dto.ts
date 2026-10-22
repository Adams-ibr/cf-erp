import { IsString, IsOptional, IsEnum, IsUUID, IsArray, IsBoolean, MinLength, MaxLength, ValidateNested } from 'class-validator';
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

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RetentionPolicy {
  NONE = 'NONE',
  SHORT_TERM = 'SHORT_TERM',
  MEDIUM_TERM = 'MEDIUM_TERM',
  LONG_TERM = 'LONG_TERM',
  PERMANENT = 'PERMANENT',
  CUSTOM = 'CUSTOM',
}

export enum Classification {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  TOP_SECRET = 'TOP_SECRET',
}

export enum AccessLevel {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  TEAM = 'TEAM',
  DEPARTMENT = 'DEPARTMENT',
  COMPANY = 'COMPANY',
}

export class CreateDocumentDto {
  @ApiProperty({ example: 'DOC-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Commercial Invoice' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Commercial invoice for shipment SHIP-001' })
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

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @MinLength(1)
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  @Min(0)
  size: number;

  @ApiProperty({ example: 'sha256:abc123...' })
  @IsString()
  @MinLength(1)
  checksum: string;

  @ApiPropertyOptional({ example: 'local' })
  @IsOptional()
  @IsString()
  storageProvider?: string;

  @ApiProperty({ example: '/uploads/documents/doc-001.pdf' })
  @IsString()
  @MinLength(1)
  storagePath: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/doc-001.pdf' })
  @IsOptional()
  @IsUrl()
  storageUrl?: string;

  @ApiPropertyOptional({ example: 'shipping' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: RetentionPolicy, example: RetentionPolicy.MEDIUM_TERM })
  @IsOptional()
  @IsEnum(RetentionPolicy)
  retentionPolicy?: RetentionPolicy;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  retentionDate?: Date;

  @ApiPropertyOptional({ enum: Classification, example: Classification.INTERNAL })
  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;

  @ApiPropertyOptional({ enum: AccessLevel, example: AccessLevel.PRIVATE })
  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;

  @ApiPropertyOptional({ example: 'folder-id' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ example: 'template-id' })
  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({ example: 'Updated Commercial Invoice' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({ example: 'Shipping' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: 'shipping, invoice' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: RetentionPolicy })
  @IsOptional()
  @IsEnum(RetentionPolicy)
  retentionPolicy?: RetentionPolicy;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  retentionDate?: Date;

  @ApiPropertyOptional({ enum: Classification })
  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;

  @ApiPropertyOptional({ enum: AccessLevel })
  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;

  @ApiPropertyOptional({ example: 'folder-id' })
  @IsOptional()
  @IsUUID()
  folderId?: string;
}

export class DocumentQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ enum: Classification })
  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;

  @ApiPropertyOptional({ example: 'folder-id' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ example: 'template-id' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  uploadedBy?: string;

  @ApiPropertyOptional({ example: 'invoice' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class DocumentResponseDto {
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

  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  checksum: string;

  @ApiProperty()
  storageProvider: string;

  @ApiProperty()
  storagePath: string;

  @ApiPropertyOptional()
  storageUrl?: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  isLatest: boolean;

  @ApiPropertyOptional()
  previousVersionId?: string;

  @ApiPropertyOptional()
  folderId?: string;

  @ApiPropertyOptional()
  templateId?: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: RetentionPolicy })
  retentionPolicy?: RetentionPolicy;

  @ApiPropertyOptional()
  retentionDate?: Date;

  @ApiProperty({ enum: Classification })
  classification: Classification;

  @ApiProperty({ enum: AccessLevel })
  accessLevel: AccessLevel;

  @ApiProperty()
  tenantId: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiProperty()
  uploadedBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MoveDocumentDto {
  @ApiProperty({ example: 'new-folder-id' })
  @IsUUID()
  folderId: string;
}

export class CopyDocumentDto {
  @ApiProperty({ example: 'DOC-002' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  newCode: string;

  @ApiProperty({ example: 'Copied Document' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  newName: string;

  @ApiPropertyOptional({ example: 'new-folder-id' })
  @IsOptional()
  @IsUUID()
  folderId?: string;
}