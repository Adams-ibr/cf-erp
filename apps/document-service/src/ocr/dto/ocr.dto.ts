import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum OCRStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class ProcessOCRDto {
  @ApiPropertyOptional({ example: 'tesseract' })
  @IsOptional()
  @IsString()
  engine?: string;

  @ApiPropertyOptional({ example: 'eng' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageStart?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageEnd?: number;
}

export class OCRQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: OCRStatus })
  @IsOptional()
  @IsEnum(OCRStatus)
  status?: OCRStatus;

  @ApiPropertyOptional({ example: 'tesseract' })
  @IsOptional()
  @IsString()
  engine?: string;
}

export class OCRResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  documentId: string;

  @ApiProperty()
  engine: string;

  @ApiProperty()
  language: string;

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  extractedText: string;

  @ApiPropertyOptional()
  structuredData?: Record<string, unknown>;

  @ApiPropertyOptional()
  boundingBoxes?: Record<string, unknown>;

  @ApiPropertyOptional()
  processingTime?: number;

  @ApiProperty({ enum: OCRStatus })
  status: OCRStatus;

  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}