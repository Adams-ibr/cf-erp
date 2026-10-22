import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, ValidateNested, IsArray, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum BookingStatus {
  REQUESTED = 'REQUESTED',
  QUOTED = 'QUOTED',
  CONFIRMED = 'CONFIRMED',
  BOOKED = 'BOOKED',
  CANCELLED = 'CANCELLED',
  AMENDED = 'AMENDED',
  SPLIT = 'SPLIT',
  ROLLED = 'ROLLED',
  EXPIRED = 'EXPIRED',
  ON_HOLD = 'ON_HOLD',
}

export enum BookingType {
  FCL = 'FCL',
  LCL = 'LCL',
  AIR = 'AIR',
  ROAD = 'ROAD',
  RAIL = 'RAIL',
  MULTIMODAL = 'MULTIMODAL',
  COURIER = 'COURIER',
  BREAKBULK = 'BREAKBULK',
  RO_RO = 'RO_RO',
  PROJECT = 'PROJECT',
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

export class CreateBookingDto {
  @ApiProperty({ example: 'BKG-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ example: 'REF-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiPropertyOptional({ enum: BookingType, example: BookingType.FCL })
  @IsOptional()
  @IsEnum(BookingType)
  type?: BookingType;

  @ApiPropertyOptional({ enum: BookingStatus, example: BookingStatus.REQUESTED })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

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

  @ApiProperty({ example: 'carrier-id' })
  @IsUUID()
  carrierId: string;

  @ApiPropertyOptional({ example: 'vessel-id' })
  @IsOptional()
  @IsUUID()
  vesselId?: string;

  @ApiPropertyOptional({ example: 'voyage-id' })
  @IsOptional()
  @IsUUID()
  voyageId?: string;

  @ApiPropertyOptional({ example: 'job-id' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({ example: 'shipment-id' })
  @IsOptional()
  @IsUUID()
  shipmentId?: string;

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

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pol?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pod?: string;

  @ApiPropertyOptional({ example: 'Final Destination' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  finalDestination?: string;

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

  @ApiPropertyOptional({ example: '3' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  hazardousClass?: string;

  @ApiPropertyOptional({ example: 'UN1234' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unNumber?: string;

  @ApiPropertyOptional({ example: '3' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  imdgClass?: string;

  @ApiPropertyOptional({ example: 'II' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  packingGroup?: string;

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
  etd?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  eta?: Date;

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

  @ApiPropertyOptional({ example: 'Standard terms' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  terms?: string;

  @ApiPropertyOptional({ type: () => [CreateBookingSpaceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookingSpaceDto)
  spaces?: CreateBookingSpaceDto[];
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ example: 'REF-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiPropertyOptional({ enum: BookingType })
  @IsOptional()
  @IsEnum(BookingType)
  type?: BookingType;

  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

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

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pol?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pod?: string;

  @ApiPropertyOptional({ example: 'Final Destination' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  finalDestination?: string;

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
  etd?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  eta?: Date;

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

export class CreateBookingSpaceDto {
  @ApiProperty({ enum: ['DRY_20FT', 'DRY_40FT', 'DRY_40FT_HC', 'DRY_45FT_HC', 'REEFER_20FT', 'REEFER_40FT', 'REEFER_40FT_HC', 'OPEN_TOP_20FT', 'OPEN_TOP_40FT', 'FLAT_RACK_20FT', 'FLAT_RACK_40FT', 'TANK_20FT', 'TANK_40FT', 'SPECIAL'], example: 'DRY_40FT_HC' })
  @IsEnum(['DRY_20FT', 'DRY_40FT', 'DRY_40FT_HC', 'DRY_45FT_HC', 'REEFER_20FT', 'REEFER_40FT', 'REEFER_40FT_HC', 'OPEN_TOP_20FT', 'OPEN_TOP_40FT', 'FLAT_RACK_20FT', 'FLAT_RACK_40FT', 'TANK_20FT', 'TANK_40FT', 'SPECIAL'])
  containerType: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  containerCount: number;

  @ApiPropertyOptional({ example: 28000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightLimit?: number;

  @ApiPropertyOptional({ example: 76 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volumeLimit?: number;

  @ApiPropertyOptional({ example: 'rate-id' })
  @IsOptional()
  @IsUUID()
  rateId?: string;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rateAmount?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  rateCurrency?: string;
}

export class BookingQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ enum: BookingType })
  @IsOptional()
  @IsEnum(BookingType)
  type?: BookingType;

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

  @ApiPropertyOptional({ example: 'job-id' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({ example: 'shipment-id' })
  @IsOptional()
  @IsUUID()
  shipmentId?: string;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ example: 'BKG-001' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiPropertyOptional()
  reference?: string;

  @ApiProperty({ enum: BookingType })
  type: BookingType;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

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

  @ApiProperty()
  carrierId: string;

  @ApiPropertyOptional()
  vesselId?: string;

  @ApiPropertyOptional()
  voyageId?: string;

  @ApiPropertyOptional()
  jobId?: string;

  @ApiPropertyOptional()
  shipmentId?: string;

  @ApiProperty()
  origin: string;

  @ApiProperty()
  destination: string;

  @ApiPropertyOptional()
  pol?: string;

  @ApiPropertyOptional()
  pod?: string;

  @ApiPropertyOptional()
  finalDestination?: string;

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
  hazardousClass?: string;

  @ApiPropertyOptional()
  unNumber?: string;

  @ApiPropertyOptional()
  imdgClass?: string;

  @ApiPropertyOptional()
  packingGroup?: string;

  @ApiPropertyOptional()
  pickupDate?: Date;

  @ApiPropertyOptional()
  deliveryDate?: Date;

  @ApiPropertyOptional()
  cutoffDate?: Date;

  @ApiPropertyOptional()
  etd?: Date;

  @ApiPropertyOptional()
  eta?: Date;

  @ApiPropertyOptional()
  atd?: Date;

  @ApiPropertyOptional()
  ata?: Date;

  @ApiPropertyOptional()
  confirmedAt?: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiPropertyOptional()
  cancelReason?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  internalNotes?: string;

  @ApiPropertyOptional()
  terms?: string;

  @ApiPropertyOptional({ type: () => BookingSpaceResponseDto, isArray: true })
  spaces?: BookingSpaceResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BookingSpaceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  containerType: string;

  @ApiProperty()
  containerCount: number;

  @ApiPropertyOptional()
  weightLimit?: number;

  @ApiPropertyOptional()
  volumeLimit?: number;

  @ApiPropertyOptional()
  rateId?: string;

  @ApiPropertyOptional()
  rateAmount?: number;

  @ApiPropertyOptional()
  rateCurrency?: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  allocatedAt?: Date;

  @ApiPropertyOptional()
  releasedAt?: Date;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional({ type: () => SpaceAllocationResponseDto, isArray: true })
  allocations?: SpaceAllocationResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SpaceAllocationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingSpaceId: string;

  @ApiProperty()
  containerId: string;

  @ApiProperty()
  containerNumber: string;

  @ApiPropertyOptional()
  sealNumber?: string;

  @ApiProperty()
  allocatedAt: Date;

  @ApiPropertyOptional()
  releasedAt?: Date;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ConfirmBookingDto {
  @ApiPropertyOptional({ example: 'Confirmed by carrier' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class CancelBookingDto {
  @ApiProperty({ example: 'Customer cancelled order' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  reason: string;
}

export class AmendBookingDto {
  @ApiPropertyOptional({ example: 'BKG-001-A1' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  newCode?: string;

  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  newStatus?: BookingStatus;

  @ApiPropertyOptional({ example: 'Changed vessel' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}