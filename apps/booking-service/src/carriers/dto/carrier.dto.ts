import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsEmail, IsUrl, IsBoolean, IsArray, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum CarrierType {
  SHIPPING_LINE = 'SHIPPING_LINE',
  AIRLINE = 'AIRLINE',
  TRUCKING = 'TRUCKING',
  RAIL = 'RAIL',
  NVOCC = 'NVOCC',
  FREIGHT_FORWARDER = 'FREIGHT_FORWARDER',
  COURIER = 'COURIER',
  MULTIMODAL = 'MULTIMODAL',
}

export class CreateCarrierDto {
  @ApiProperty({ example: 'MSC' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Mediterranean Shipping Company' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ enum: CarrierType, example: CarrierType.SHIPPING_LINE })
  @IsEnum(CarrierType)
  type: CarrierType;

  @ApiPropertyOptional({ example: 'MSCU' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  scac?: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mcNumber?: string;

  @ApiPropertyOptional({ example: '789012' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  dotNumber?: string;

  @ApiPropertyOptional({ example: 'MSC' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  iataCode?: string;

  @ApiPropertyOptional({ example: 'FMC123' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  fmcNumber?: string;

  @ApiPropertyOptional({ example: 'https://msc.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'booking@msc.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1-800-MSC-LINE' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'John Smith' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'john.smith@msc.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+1-800-MSC-LINE' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  contactPhone?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(365)
  paymentTerms?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  contractStart?: Date;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  contractEnd?: Date;

  @ApiPropertyOptional({ example: 'Preferred carrier for Asia-US' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateCarrierDto {
  @ApiPropertyOptional({ example: 'Mediterranean Shipping Company' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: CarrierType })
  @IsOptional()
  @IsEnum(CarrierType)
  type?: CarrierType;

  @ApiPropertyOptional({ example: 'MSCU' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  scac?: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mcNumber?: string;

  @ApiPropertyOptional({ example: '789012' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  dotNumber?: string;

  @ApiPropertyOptional({ example: 'MSC' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  iataCode?: string;

  @ApiPropertyOptional({ example: 'FMC123' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  fmcNumber?: string;

  @ApiPropertyOptional({ example: 'https://msc.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'booking@msc.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1-800-MSC-LINE' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'John Smith' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'john.smith@msc.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+1-800-MSC-LINE' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  contactPhone?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(365)
  paymentTerms?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  contractStart?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  contractEnd?: Date;

  @ApiPropertyOptional({ example: 'Preferred carrier for Asia-US' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class CreateCarrierServiceDto {
  @ApiProperty({ example: 'Asia-US West Coast' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  serviceName: string;

  @ApiPropertyOptional({ example: 'AEU' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  serviceCode?: string;

  @ApiProperty({ enum: ['SEA_FCL', 'SEA_LCL', 'AIR', 'ROAD', 'RAIL', 'MULTIMODAL', 'COURIER'], example: 'SEA_FCL' })
  @IsEnum(['SEA_FCL', 'SEA_LCL', 'AIR', 'ROAD', 'RAIL', 'MULTIMODAL', 'COURIER'])
  mode: string;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  origin?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  destination?: string;

  @ApiPropertyOptional({ example: 21 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  transitTime?: number;

  @ApiPropertyOptional({ example: 'Weekly' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  frequency?: string;

  @ApiPropertyOptional({ type: [String], example: ['DRY_40FT_HC', 'REEFER_40FT_HC'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CarrierQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CarrierType })
  @IsOptional()
  @IsEnum(CarrierType)
  type?: CarrierType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;

  @ApiPropertyOptional({ example: 'MSC' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CarrierResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: CarrierType })
  type: CarrierType;

  @ApiPropertyOptional()
  scac?: string;

  @ApiPropertyOptional()
  mcNumber?: string;

  @ApiPropertyOptional()
  dotNumber?: string;

  @ApiPropertyOptional()
  iataCode?: string;

  @ApiPropertyOptional()
  fmcNumber?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  address?: Record<string, unknown>;

  @ApiPropertyOptional()
  contactPerson?: string;

  @ApiPropertyOptional()
  contactEmail?: string;

  @ApiPropertyOptional()
  contactPhone?: string;

  @ApiProperty()
  paymentTerms: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  creditLimit: number;

  @ApiPropertyOptional()
  rating?: number;

  @ApiProperty()
  isPreferred: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  contractStart?: Date;

  @ApiPropertyOptional()
  contractEnd?: Date;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional({ type: () => CarrierServiceResponseDto, isArray: true })
  services?: CarrierServiceResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CarrierServiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  serviceName: string;

  @ApiPropertyOptional()
  serviceCode?: string;

  @ApiProperty()
  mode: string;

  @ApiPropertyOptional()
  origin?: string;

  @ApiPropertyOptional()
  destination?: string;

  @ApiPropertyOptional()
  transitTime?: number;

  @ApiPropertyOptional()
  frequency?: string;

  @ApiProperty({ type: [String] })
  equipment: string[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}