import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsUrl, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum VesselType {
  CONTAINER = 'CONTAINER',
  BULK = 'BULK',
  TANKER = 'TANKER',
  RO_RO = 'RO_RO',
  GENERAL_CARGO = 'GENERAL_CARGO',
  REEFER = 'REEFER',
  LNG = 'LNG',
  LPG = 'LPG',
  OTHER = 'OTHER',
}

export class CreateVesselDto {
  @ApiProperty({ example: 'MSC-GULSUN' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'MSC Gülsün' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: '9837456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  imo?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mmsi?: string;

  @ApiPropertyOptional({ example: '3EXY4' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  callSign?: string;

  @ApiPropertyOptional({ example: 'PA' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  flag?: string;

  @ApiProperty({ enum: VesselType, example: VesselType.CONTAINER })
  @IsEnum(VesselType)
  type: VesselType;

  @ApiPropertyOptional({ example: 23756 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ example: 197000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dwt?: number;

  @ApiPropertyOptional({ example: 400 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  loa?: number;

  @ApiPropertyOptional({ example: 61.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  beam?: number;

  @ApiPropertyOptional({ example: 16.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  draft?: number;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1800)
  @Max(2100)
  yearBuilt?: number;

  @ApiPropertyOptional({ example: 'Samsung Heavy Industries' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  builder?: string;

  @ApiPropertyOptional({ example: 'MSC Mediterranean Shipping' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  owner?: string;

  @ApiPropertyOptional({ example: 'MSC Mediterranean Shipping' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  operator?: string;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateVesselDto {
  @ApiPropertyOptional({ example: 'MSC Gülsün' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: '9837456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  imo?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mmsi?: string;

  @ApiPropertyOptional({ example: '3EXY4' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  callSign?: string;

  @ApiPropertyOptional({ example: 'PA' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  flag?: string;

  @ApiPropertyOptional({ enum: VesselType })
  @IsOptional()
  @IsEnum(VesselType)
  type?: VesselType;

  @ApiPropertyOptional({ example: 23756 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ example: 197000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dwt?: number;

  @ApiPropertyOptional({ example: 400 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  loa?: number;

  @ApiPropertyOptional({ example: 61.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  beam?: number;

  @ApiPropertyOptional({ example: 16.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  draft?: number;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1800)
  @Max(2100)
  yearBuilt?: number;

  @ApiPropertyOptional({ example: 'Samsung Heavy Industries' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  builder?: string;

  @ApiPropertyOptional({ example: 'MSC Mediterranean Shipping' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  owner?: string;

  @ApiPropertyOptional({ example: 'MSC Mediterranean Shipping' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  operator?: string;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class VesselQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: VesselType })
  @IsOptional()
  @IsEnum(VesselType)
  type?: VesselType;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '9837456' })
  @IsOptional()
  @IsString()
  imo?: string;

  @ApiPropertyOptional({ example: 'MSC' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class VesselResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  imo?: string;

  @ApiPropertyOptional()
  mmsi?: string;

  @ApiPropertyOptional()
  callSign?: string;

  @ApiPropertyOptional()
  flag?: string;

  @ApiProperty({ enum: VesselType })
  type: VesselType;

  @ApiPropertyOptional()
  capacity?: number;

  @ApiPropertyOptional()
  dwt?: number;

  @ApiPropertyOptional()
  loa?: number;

  @ApiPropertyOptional()
  beam?: number;

  @ApiPropertyOptional()
  draft?: number;

  @ApiPropertyOptional()
  yearBuilt?: number;

  @ApiPropertyOptional()
  builder?: string;

  @ApiPropertyOptional()
  owner?: string;

  @ApiPropertyOptional()
  operator?: string;

  @ApiPropertyOptional()
  carrierId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}