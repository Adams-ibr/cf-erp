import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, ValidateNested, IsArray, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum TrackingEventType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  EQUIPMENT_ASSIGNED = 'EQUIPMENT_ASSIGNED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKUP_COMPLETED = 'PICKUP_COMPLETED',
  GATE_IN = 'GATE_IN',
  LOADED_ON_VESSEL = 'LOADED_ON_VESSEL',
  VESSEL_DEPARTED = 'VESSEL_DEPARTED',
  IN_TRANSIT = 'IN_TRANSIT',
  VESSEL_ARRIVED = 'VESSEL_ARRIVED',
  DISCHARGED = 'DISCHARGED',
  GATE_OUT = 'GATE_OUT',
  DELIVERY_SCHEDULED = 'DELIVERY_SCHEDULED',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
  CUSTOMS_FILED = 'CUSTOMS_FILED',
  CUSTOMS_CLEARED = 'CUSTOMS_CLEARED',
  CUSTOMS_HOLD = 'CUSTOMS_HOLD',
  CUSTOMS_EXAM = 'CUSTOMS_EXAM',
  EXCEPTION = 'EXCEPTION',
  DELAY = 'DELAY',
  DAMAGE = 'DAMAGE',
  TEMPERATURE_ALERT = 'TEMPERATURE_ALERT',
  DOCUMENT_RECEIVED = 'DOCUMENT_RECEIVED',
  DOCUMENT_VERIFIED = 'DOCUMENT_VERIFIED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  MILESTONE_REACHED = 'MILESTONE_REACHED',
}

export enum MilestoneType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  PICKUP_COMPLETED = 'PICKUP_COMPLETED',
  LOADED_ON_VESSEL = 'LOADED_ON_VESSEL',
  VESSEL_DEPARTED = 'VESSEL_DEPARTED',
  VESSEL_ARRIVED = 'VESSEL_ARRIVED',
  DISCHARGED = 'DISCHARGED',
  CUSTOMS_CLEARED = 'CUSTOMS_CLEARED',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
}

export enum ShipmentStatus {
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

export class CreateTrackingEventDto {
  @ApiProperty({ example: 'TRK-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'shipment-id' })
  @IsUUID()
  shipmentId: string;

  @ApiProperty({ enum: TrackingEventType, example: TrackingEventType.LOADED_ON_VESSEL })
  @IsEnum(TrackingEventType)
  type: TrackingEventType;

  @ApiProperty({ example: 'Loaded on vessel MSC Gülsün' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  status: string;

  @ApiProperty({ example: 'Port of Shanghai' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  location: string;

  @ApiPropertyOptional({ example: 31.2304 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 121.4737 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  @Type(() => Date)
  @IsDate()
  timestamp: Date;

  @ApiProperty({ example: 'CARRIER_API' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  source: string;

  @ApiPropertyOptional({ example: 'API-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sourceReference?: string;

  @ApiPropertyOptional({ example: 'vessel-id' })
  @IsOptional()
  @IsUUID()
  vesselId?: string;

  @ApiPropertyOptional({ example: 'voyage-id' })
  @IsOptional()
  @IsUUID()
  voyageId?: string;

  @ApiPropertyOptional({ example: 'container-id' })
  @IsOptional()
  @IsUUID()
  containerId?: string;

  @ApiPropertyOptional({ example: 'equipment-id' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  equipmentId?: string;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-50)
  @Max(100)
  temperature?: number;

  @ApiPropertyOptional({ example: 65 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity?: number.

  @ApiPropertyOptional({ example: 'Container loaded successfully' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string.

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>.

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isMilestone?: boolean.

  @ApiPropertyOptional({ enum: MilestoneType, example: MilestoneType.LOADED_ON_VESSEL })
  @IsOptional()
  @IsEnum(MilestoneType)
  milestoneType?: MilestoneType.
}

export class UpdateTrackingEventDto {
  @ApiPropertyOptional({ example: 'Loaded on vessel MSC Gülsün' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  status?: string.

  @ApiPropertyOptional({ example: 'Port of Shanghai' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  location?: string.

  @ApiPropertyOptional({ example: 31.2304 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number.

  @ApiPropertyOptional({ example: 121.4737 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number.

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  timestamp?: Date.

  @ApiPropertyOptional({ example: 'Container loaded successfully' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string.

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>.

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isMilestone?: boolean.

  @ApiPropertyOptional({ enum: MilestoneType })
  @IsOptional()
  @IsEnum(MilestoneType)
  milestoneType?: MilestoneType.
}

export class TrackingEventQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TrackingEventType })
  @IsOptional()
  @IsEnum(TrackingEventType)
  type?: TrackingEventType.

  @ApiPropertyOptional({ example: 'shipment-id' })
  @IsOptional()
  @IsUUID()
  shipmentId?: string.

  @ApiPropertyOptional({ example: 'vessel-id' })
  @IsOptional()
  @IsUUID()
  vesselId?: string.

  @ApiPropertyOptional({ example: 'voyage-id' })
  @IsOptional()
  @IsUUID()
  voyageId?: string.

  @ApiPropertyOptional({ example: 'container-id' })
  @IsOptional()
  @IsUUID()
  containerId?: string.

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isMilestone?: boolean.

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  timestampFrom?: Date.

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  timestampTo?: Date.

  @ApiPropertyOptional({ example: 'TRK-001' })
  @IsOptional()
  @IsString()
  search?: string.
}

export class TrackingEventResponseDto {
  @ApiProperty()
  id: string.

  @ApiProperty()
  code: string.

  @ApiProperty()
  shipmentId: string.

  @ApiProperty({ enum: TrackingEventType })
  type: TrackingEventType.

  @ApiProperty()
  status: string.

  @ApiProperty()
  location: string.

  @ApiPropertyOptional()
  latitude?: number.

  @ApiPropertyOptional()
  longitude?: number.

  @ApiProperty()
  timestamp: Date.

  @ApiProperty()
  source: string.

  @ApiPropertyOptional()
  sourceReference?: string.

  @ApiPropertyOptional()
  vesselId?: string.

  @ApiPropertyOptional()
  voyageId?: string.

  @ApiPropertyOptional()
  containerId?: string.

  @ApiPropertyOptional()
  equipmentId?: string.

  @ApiPropertyOptional()
  temperature?: number.

  @ApiPropertyOptional()
  humidity?: number.

  @ApiPropertyOptional()
  details?: string.

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>.

  @ApiProperty()
  isMilestone: boolean.

  @ApiPropertyOptional({ enum: MilestoneType })
  milestoneType?: MilestoneType.

  @ApiProperty()
  createdAt: Date.
}