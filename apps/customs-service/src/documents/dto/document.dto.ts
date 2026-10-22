import { IsString, IsOptional, IsEnum, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum DocumentType {
  COMMERCIAL_INVOICE = 'COMMERCIAL_INVOICE',
  PACKING_LIST = 'PACKING_LIST',
  BILL_OF_LADING = 'BILL_OF_LADING',
  AIRWAY_BILL = 'AIRWAY_BILL',
  CERTIFICATE_OF_ORIGIN = 'CERTIFICATE_OF_ORIGIN',
  INSURANCE_CERTIFICATE = 'INSURANCE_CERTIFICATE',
  IMPORT_LICENSE = 'IMPORT_LICENSE',
  EXPORT_LICENSE = 'EXPORT_LICENSE',
  DANGEROUS_GOODS_DECLARATION = 'DANGEROUS_GOODS_DECLARATION',
  MSDS = 'MSDS',
  PHYTOSANITARY_CERTIFICATE = 'PHYTOSANITARY_CERTIFICATE',
  FUMIGATION_CERTIFICATE = 'FUMIGATION_CERTIFICATE',
  WEIGHT_CERTIFICATE = 'WEIGHT_CERTIFICATE',
  INSPECTION_CERTIFICATE = 'INSPECTION_CERTIFICATE',
  CUSTOMS_DECLARATION = 'CUSTOMS_DECLARATION',
  CUSTOMS_BOND = 'CUSTOMS_BOND',
  POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  NOT_REQUIRED = 'NOT_REQUIRED',
}

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.COMMERCIAL_INVOICE })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ example: 'Commercial Invoice INV-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'https://storage.example.com/docs/inv-001.pdf' })
  @IsString()
  @MinLength(1)
  url: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @MinLength(1)
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  @Min(0)
  size: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sequence?: number;
}

export class DocumentQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

export class VerifyDocumentDto {
  @ApiProperty({ enum: ['VERIFIED', 'REJECTED'] })
  @IsEnum(['VERIFIED', 'REJECTED'])
  status: 'VERIFIED' | 'REJECTED';

  @ApiPropertyOptional({ example: 'Document is valid' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class DocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: DocumentType })
  type: DocumentType;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;

  @ApiProperty()
  isRequired: boolean;

  @ApiProperty()
  sequence: number;

  @ApiPropertyOptional()
  verifiedAt?: Date;

  @ApiPropertyOptional()
  verifiedBy?: string;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiProperty()
  uploadedBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}