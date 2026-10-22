import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum Classification {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  TOP_SECRET = 'TOP_SECRET',
}

export class ClassifyDocumentDto {
  @ApiProperty({ enum: Classification, example: Classification.INTERNAL })
  @IsEnum(Classification)
  classification: Classification;

  @ApiProperty({ type: [String], example: ['invoice', 'shipping', 'finance'] })
  @IsArray()
  @IsString({ each: true })
  labels: string[];

  @ApiProperty({ example: 0.95 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiPropertyOptional({ example: 'ai-classifier-v1' })
  @IsOptional()
  @IsString()
  classifier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class ClassificationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: Classification })
  @IsOptional()
  @IsEnum(Classification)
  classification?: Classification;

  @ApiPropertyOptional({ example: 'ai-classifier-v1' })
  @IsOptional()
  @IsString()
  classifier?: string;
}

export class ClassificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  documentId: string;

  @ApiProperty({ enum: Classification })
  classification: Classification;

  @ApiProperty({ type: [String] })
  labels: string[];

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  classifier: string;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}