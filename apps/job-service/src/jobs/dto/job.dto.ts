import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, ValidateNested, IsArray, MinLength, MaxLength, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum JobType {
  FREIGHT_FORWARDING = 'FREIGHT_FORWARDING',
  CUSTOMS_BROKERAGE = 'CUSTOMS_BROKERAGE',
  WAREHOUSING = 'WAREHOUSING',
  TRANSPORT = 'TRANSPORT',
  CONSOLIDATION = 'CONSOLIDATION',
  DECONSOLIDATION = 'DECONSOLIDATION',
  PROJECT_CARGO = 'PROJECT_CARGO',
  COURIER = 'COURIER',
  OTHER = 'OTHER',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  QUOTE_REQUESTED = 'QUOTE_REQUESTED',
  QUOTED = 'QUOTED',
  BOOKED = 'BOOKED',
  CONFIRMED = 'CONFIRMED',
  DOCUMENTS_PENDING = 'DOCUMENTS_PENDING',
  DOCUMENTS_RECEIVED = 'DOCUMENTS_RECEIVED',
  CUSTOMS_PENDING = 'CUSTOMS_PENDING',
  CUSTOMS_CLEARED = 'CUSTOMS_CLEARED',
  CUSTOMS_HOLD = 'CUSTOMS_HOLD',
  CUSTOMS_EXAM = 'CUSTOMS_EXAM',
  LOADED = 'LOADED',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  UNLOADED = 'UNLOADED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
  PROBLEM = 'PROBLEM',
}

export enum JobPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum ShipmentMode {
  SEA_FCL = 'SEA_FCL',
  SEA_LCL = 'SEA_LCL',
  AIR = 'AIR',
  ROAD = 'ROAD',
  RAIL = 'RAIL',
  MULTIMODAL = 'MULTIMODAL',
  COURIER = 'COURIER',
}

export enum ShipmentDirection {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  TRANSIT = 'TRANSIT',
  CROSS_TRADE = 'CROSS_TRADE',
  DOMESTIC = 'DOMESTIC',
}

export enum Incoterm {
  EXW = 'EXW',
  FCA = 'FCA',
  CPT = 'CPT',
  CIP = 'CIP',
  DAP = 'DAP',
  DPU = 'DPU',
  DDP = 'DDP',
  FAS = 'FAS',
  FOB = 'FOB',
  CFR = 'CFR',
  CIF = 'CIF',
}

export class CreateJobDto {
  @ApiProperty({ example: 'JOB-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ example: 'REF-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiPropertyOptional({ enum: JobType, example: JobType.FREIGHT_FORWARDING })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @ApiPropertyOptional({ enum: JobStatus, example: JobStatus.DRAFT })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ enum: JobPriority, example: JobPriority.MEDIUM })
  @IsOptional()
  @IsEnum(JobPriority)
  priority?: JobPriority;

  @ApiPropertyOptional({ enum: ShipmentMode, example: ShipmentMode.SEA_FCL })
  @IsOptional()
  @IsEnum(ShipmentMode)
  mode?: ShipmentMode;

  @ApiPropertyOptional({ enum: ShipmentDirection, example: ShipmentDirection.IMPORT })
  @IsOptional()
  @IsEnum(ShipmentDirection)
  direction?: ShipmentDirection;

  @ApiPropertyOptional({ enum: Incoterm, example: Incoterm.FOB })
  @IsOptional()
  @IsEnum(Incoterm)
  incoterm?: Incoterm;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 1.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  exchangeRate?: number;

  @ApiProperty({ example: 'customer-id' })
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  salesRepId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  operationsRepId?: string;

  @ApiProperty({ example: 'Shanghai' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  origin: string;

  @ApiProperty({ example: 'Los Angeles' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  destination: string;

  @ApiPropertyOptional({ example: 'Electronics' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  commodity?: string;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 33 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: 'CONTAINER' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ example: 55000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  insuranceValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  pickupDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deliveryDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  cutoffDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  estimatedDeparture?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  estimatedArrival?: Date;

  @ApiPropertyOptional({ example: 'Handle with care' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ example: 'Internal notes' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;

  @ApiPropertyOptional({ example: 'quotation-id' })
  @IsOptional()
  @IsUUID()
  quotationId?: string;

  @ApiPropertyOptional({ example: 'rate-card-id' })
  @IsOptional()
  @IsUUID()
  rateCardId?: string;

  @ApiPropertyOptional({ type: () => [CreateJobLegDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJobLegDto)
  legs?: CreateJobLegDto[];
}

export class UpdateJobDto {
  @ApiPropertyOptional({ example: 'REF-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ enum: JobPriority })
  @IsOptional()
  @IsEnum(JobPriority)
  priority?: JobPriority;

  @ApiPropertyOptional({ enum: ShipmentMode })
  @IsOptional()
  @IsEnum(ShipmentMode)
  mode?: ShipmentMode;

  @ApiPropertyOptional({ enum: ShipmentDirection })
  @IsOptional()
  @IsEnum(ShipmentDirection)
  direction?: ShipmentDirection;

  @ApiPropertyOptional({ enum: Incoterm })
  @IsOptional()
  @IsEnum(Incoterm)
  incoterm?: Incoterm;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 1.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  exchangeRate?: number;

  @ApiPropertyOptional({ example: 'customer-id' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  salesRepId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  operationsRepId?: string;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  origin?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  destination?: string;

  @ApiPropertyOptional({ example: 'Electronics' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  commodity?: string;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 33 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: 'CONTAINER' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ example: 55000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  insuranceValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  pickupDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deliveryDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  cutoffDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  estimatedDeparture?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  estimatedArrival?: Date;

  @ApiPropertyOptional({ example: 'Handle with care' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ example: 'Internal notes' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;
}

export class CreateJobLegDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  sequence: number;

  @ApiProperty({ enum: ['PRE_CARRIAGE', 'MAIN_CARRIAGE', 'ON_CARRIAGE', 'INLAND', 'FEEDER', 'TRANSSHIPMENT'], example: 'MAIN_CARRIAGE' })
  @IsEnum(['PRE_CARRIAGE', 'MAIN_CARRIAGE', 'ON_CARRIAGE', 'INLAND', 'FEEDER', 'TRANSSHIPMENT'])
  type: string;

  @ApiProperty({ enum: ShipmentMode, example: ShipmentMode.SEA_FCL })
  @IsEnum(ShipmentMode)
  mode: ShipmentMode;

  @ApiProperty({ example: 'Shanghai' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  origin: string;

  @ApiProperty({ example: 'Los Angeles' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  destination: string;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiPropertyOptional({ example: 'vessel-id' })
  @IsOptional()
  @IsUUID()
  vesselId?: string;

  @ApiPropertyOptional({ example: 'voyage-id' })
  @IsOptional()
  @IsUUID()
  voyageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  etd?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  eta?: Date;
}

export class JobQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @ApiPropertyOptional({ enum: JobPriority })
  @IsOptional()
  @IsEnum(JobPriority)
  priority?: JobPriority;

  @ApiPropertyOptional({ enum: ShipmentMode })
  @IsOptional()
  @IsEnum(ShipmentMode)
  mode?: ShipmentMode;

  @ApiPropertyOptional({ example: 'customer-id' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  salesRepId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  operationsRepId?: string;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ example: 'JOB-001' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class JobResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiPropertyOptional()
  reference?: string;

  @ApiProperty({ enum: JobType })
  type: JobType;

  @ApiProperty({ enum: JobStatus })
  status: JobStatus;

  @ApiProperty({ enum: JobPriority })
  priority: JobPriority;

  @ApiProperty({ enum: ShipmentMode })
  mode: ShipmentMode;

  @ApiProperty({ enum: ShipmentDirection })
  direction: ShipmentDirection;

  @ApiProperty({ enum: Incoterm })
  incoterm: Incoterm;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  exchangeRate: number;

  @ApiProperty()
  customerId: string;

  @ApiPropertyOptional()
  supplierId?: string;

  @ApiPropertyOptional()
  salesRepId?: string;

  @ApiPropertyOptional()
  operationsRepId?: string;

  @ApiProperty()
  origin: string;

  @ApiProperty()
  destination: string;

  @ApiPropertyOptional()
  commodity?: string;

  @ApiPropertyOptional()
  weight?: number;

  @ApiPropertyOptional()
  volume?: number;

  @ApiPropertyOptional()
  quantity?: number;

  @ApiPropertyOptional()
  unit?: string;

  @ApiPropertyOptional()
  value?: number;

  @ApiPropertyOptional()
  insuranceValue?: number;

  @ApiPropertyOptional()
  pickupDate?: Date;

  @ApiPropertyOptional()
  deliveryDate?: Date;

  @ApiPropertyOptional()
  cutoffDate?: Date;

  @ApiPropertyOptional()
  estimatedDeparture?: Date;

  @ApiPropertyOptional()
  estimatedArrival?: Date;

  @ApiPropertyOptional()
  actualDeparture?: Date;

  @ApiPropertyOptional()
  actualArrival?: Date;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  internalNotes?: string;

  @ApiPropertyOptional()
  quotationId?: string;

  @ApiPropertyOptional()
  rateCardId?: string;

  @ApiPropertyOptional()
  approvedBy?: string;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiPropertyOptional()
  cancelReason?: string;

  @ApiPropertyOptional({ type: () => JobLegResponseDto, isArray: true })
  legs?: JobLegResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class JobLegResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sequence: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  mode: string;

  @ApiProperty()
  origin: string;

  @ApiProperty()
  destination: string;

  @ApiPropertyOptional()
  carrierId?: string;

  @ApiPropertyOptional()
  vesselId?: string;

  @ApiPropertyOptional()
  voyageId?: string;

  @ApiPropertyOptional()
  etd?: Date;

  @ApiPropertyOptional()
  eta?: Date;

  @ApiPropertyOptional()
  atd?: Date;

  @ApiPropertyOptional()
  ata?: Date;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}