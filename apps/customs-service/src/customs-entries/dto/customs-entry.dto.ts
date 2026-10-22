import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, ValidateNested, IsArray, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum CustomsEntryType {
  IMPORT_DECLARATION = 'IMPORT_DECLARATION',
  EXPORT_DECLARATION = 'EXPORT_DECLARATION',
  TRANSIT_DECLARATION = 'TRANSIT_DECLARATION',
  TEMPORARY_IMPORT = 'TEMPORARY_IMPORT',
  BONDED_WAREHOUSE = 'BONDED_WAREHOUSE',
  RE_EXPORT = 'RE_EXPORT',
  INWARD_PROCESSING = 'INWARD_PROCESSING',
  OUTWARD_PROCESSING = 'OUTWARD_PROCESSING',
  CUSTOMS_WAREHOUSE = 'CUSTOMS_WAREHOUSE',
  FREE_ZONE = 'FREE_ZONE',
}

export enum CustomsStatus {
  NOT_STARTED = 'NOT_STARTED',
  DOCUMENTS_PREPARING = 'DOCUMENTS_PREPARING',
  DOCUMENTS_SUBMITTED = 'DOCUMENTS_SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  QUERY_RAISED = 'QUERY_RAISED',
  QUERY_RESPONDED = 'QUERY_RESPONDED',
  EXAMINATION_SCHEDULED = 'EXAMINATION_SCHEDULED',
  EXAMINATION_COMPLETED = 'EXAMINATION_COMPLETED',
  ASSESSMENT_COMPLETED = 'ASSESSMENT_COMPLETED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  CLEARED = 'CLEARED',
  RELEASED = 'RELEASED',
  HOLD = 'HOLD',
  SEIZED = 'SEIZED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  AMENDED = 'AMENDED',
}

export enum ExamType {
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  X_RAY = 'X_RAY',
  PHYSICAL_EXAM = 'PHYSICAL_EXAM',
  TAILGATE = 'TAILGATE',
  INTENSIVE = 'INTENSIVE',
  NON_INTRUSIVE = 'NON_INTRUSIVE',
  CANINE = 'CANINE',
  RADIATION = 'RADIATION',
  WEIGHING = 'WEIGHING',
  SAMPLING = 'SAMPLING',
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

export class CreateCustomsEntryDto {
  @ApiProperty({ example: 'CUS-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ example: 'REF-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiProperty({ enum: CustomsEntryType, example: CustomsEntryType.IMPORT_DECLARATION })
  @IsEnum(CustomsEntryType)
  type: CustomsEntryType;

  @ApiProperty({ example: 'shipment-id' })
  @IsUUID()
  shipmentId: string;

  @ApiPropertyOptional({ example: 'job-id' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({ example: 'booking-id' })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiProperty({ example: 'customer-id' })
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'broker-id' })
  @IsOptional()
  @IsUUID()
  brokerId?: string;

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

  @ApiPropertyOptional({ example: 'container-id' })
  @IsOptional()
  @IsUUID()
  containerId?: string;

  @ApiProperty({ example: 'CN' })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  originCountry: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  destinationCountry: string;

  @ApiProperty({ example: 'Los Angeles' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  portOfEntry: string;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  portOfExit?: string;

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

  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalValue: number;

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

  @ApiPropertyOptional({ type: () => [CreateCustomsEntryLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomsEntryLineDto)
  lines?: CreateCustomsEntryLineDto[];
}

export class UpdateCustomsEntryDto {
  @ApiPropertyOptional({ example: 'REF-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiPropertyOptional({ enum: CustomsEntryType })
  @IsOptional()
  @IsEnum(CustomsEntryType)
  type?: CustomsEntryType;

  @ApiPropertyOptional({ enum: CustomsStatus })
  @IsOptional()
  @IsEnum(CustomsStatus)
  status?: CustomsStatus;

  @ApiPropertyOptional({ example: 'broker-id' })
  @IsOptional()
  @IsUUID()
  brokerId?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  portOfEntry?: string;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  portOfExit?: string;

  @ApiPropertyOptional({ enum: Incoterm })
  @IsOptional()
  @IsEnum(Incoterm)
  incoterm?: Incoterm.

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string.

  @ApiPropertyOptional({ example: 1.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  exchangeRate?: number.

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalValue?: number.

  @ApiPropertyOptional({ example: 'Handle with care' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string.

  @ApiPropertyOptional({ example: 'Internal notes' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string.
}

export class CreateCustomsEntryLineDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  lineNumber: number;

  @ApiPropertyOptional({ example: 'tariff-code-id' })
  @IsOptional()
  @IsUUID()
  tariffCodeId?: string.

  @ApiProperty({ example: 'Electronics - Smartphones' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description: string.

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  quantity: number.

  @ApiProperty({ example: 'PCS' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  unit: string.

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number.

  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value: number.

  @ApiProperty({ example: 'CN' })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  originCountry: string.

  @ApiPropertyOptional({ example: 0.05 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  dutyRate?: number.

  @ApiPropertyOptional({ example: 0.1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  taxRate?: number.

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  preferentialRate?: boolean.

  @ApiPropertyOptional({ example: 'trade-agreement-id' })
  @IsOptional()
  @IsUUID()
  tradeAgreementId?: string.

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isHazardous?: boolean.

  @ApiPropertyOptional({ example: 'UN3480' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unNumber?: string.

  @ApiPropertyOptional({ example: '9' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  imdgClass?: string.

  @ApiPropertyOptional({ example: 'II' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  packingGroup?: string.
}

export class CustomsEntryQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CustomsEntryType })
  @IsOptional()
  @IsEnum(CustomsEntryType)
  type?: CustomsEntryType.

  @ApiPropertyOptional({ enum: CustomsStatus })
  @IsOptional()
  @IsEnum(CustomsStatus)
  status?: CustomsStatus.

  @ApiPropertyOptional({ example: 'customer-id' })
  @IsOptional()
  @IsUUID()
  customerId?: string.

  @ApiPropertyOptional({ example: 'broker-id' })
  @IsOptional()
  @IsUUID()
  brokerId?: string.

  @ApiPropertyOptional({ example: 'shipment-id' })
  @IsOptional()
  @IsUUID()
  shipmentId?: string.

  @ApiPropertyOptional({ example: 'job-id' })
  @IsOptional()
  @IsUUID()
  jobId?: string.

  @ApiPropertyOptional({ example: 'booking-id' })
  @IsOptional()
  @IsUUID()
  bookingId?: string.

  @ApiPropertyOptional({ example: 'container-id' })
  @IsOptional()
  @IsUUID()
  containerId?: string.

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  portOfEntry?: string.

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  filingDateFrom?: Date.

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  filingDateTo?: Date.

  @ApiPropertyOptional({ example: 'CUS-001' })
  @IsOptional()
  @IsString()
  search?: string.
}

export class CustomsEntryResponseDto {
  @ApiProperty()
  id: string.

  @ApiProperty()
  code: string.

  @ApiPropertyOptional()
  reference?: string.

  @ApiProperty({ enum: CustomsEntryType })
  type: CustomsEntryType.

  @ApiProperty({ enum: CustomsStatus })
  status: CustomsStatus.

  @ApiPropertyOptional()
  entryNumber?: string.

  @ApiProperty()
  shipmentId: string.

  @ApiPropertyOptional()
  jobId?: string.

  @ApiPropertyOptional()
  bookingId?: string.

  @ApiProperty()
  customerId: string.

  @ApiPropertyOptional()
  supplierId?: string.

  @ApiPropertyOptional()
  brokerId?: string.

  @ApiPropertyOptional()
  carrierId?: string.

  @ApiPropertyOptional()
  vesselId?: string.

  @ApiPropertyOptional()
  voyageId?: string.

  @ApiPropertyOptional()
  containerId?: string.

  @ApiProperty()
  originCountry: string.

  @ApiProperty()
  destinationCountry: string.

  @ApiProperty()
  portOfEntry: string.

  @ApiPropertyOptional()
  portOfExit?: string.

  @ApiProperty({ enum: Incoterm })
  incoterm: Incoterm.

  @ApiProperty()
  currency: string.

  @ApiProperty()
  exchangeRate: number.

  @ApiProperty()
  totalValue: number.

  @ApiProperty()
  totalDuty: number.

  @ApiProperty()
  totalTax: number.

  @ApiProperty()
  totalFees: number.

  @ApiProperty()
  totalPayable: number.

  @ApiProperty()
  paidAmount: number.

  @ApiProperty()
  balanceAmount: number.

  @ApiPropertyOptional()
  filingDate?: Date.

  @ApiPropertyOptional()
  acceptanceDate?: Date.

  @ApiPropertyOptional()
  clearanceDate?: Date.

  @ApiPropertyOptional()
  releaseDate?: Date.

  @ApiPropertyOptional()
  examDate?: Date.

  @ApiPropertyOptional({ enum: ExamType })
  examType?: ExamType.

  @ApiPropertyOptional({ enum: ExamResult })
  examResult?: ExamResult.

  @ApiPropertyOptional()
  holdReason?: string.

  @ApiPropertyOptional()
  notes?: string.

  @ApiPropertyOptional()
  internalNotes?: string.

  @ApiPropertyOptional({ type: () => CustomsEntryLineResponseDto, isArray: true })
  lines?: CustomsEntryLineResponseDto[].

  @ApiPropertyOptional({ type: () => CustomsDocumentResponseDto, isArray: true })
  documents?: CustomsDocumentResponseDto[].

  @ApiPropertyOptional({ type: () => InspectionResponseDto, isArray: true })
  inspections?: InspectionResponseDto[].

  @ApiPropertyOptional({ type: () => CustomsFeeResponseDto, isArray: true })
  fees?: CustomsFeeResponseDto[].

  @ApiProperty()
  createdAt: Date.

  @ApiProperty()
  updatedAt: Date.
}

export class CustomsEntryLineResponseDto {
  @ApiProperty()
  id: string.

  @ApiProperty()
  lineNumber: number.

  @ApiPropertyOptional()
  tariffCodeId?: string.

  @ApiProperty()
  description: string.

  @ApiProperty()
  quantity: number.

  @ApiProperty()
  unit: string.

  @ApiPropertyOptional()
  weight?: number.

  @ApiProperty()
  value: number.

  @ApiProperty()
  originCountry: string.

  @ApiProperty()
  dutyRate: number.

  @ApiProperty()
  dutyAmount: number.

  @ApiProperty()
  taxRate: number.

  @ApiProperty()
  taxAmount: number.

  @ApiProperty()
  feeAmount: number.

  @ApiProperty()
  preferentialRate: boolean.

  @ApiPropertyOptional()
  tradeAgreementId?: string.

  @ApiProperty()
  isHazardous: boolean.

  @ApiPropertyOptional()
  unNumber?: string.

  @ApiPropertyOptional()
  imdgClass?: string.

  @ApiPropertyOptional()
  packingGroup?: string.

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>.

  @ApiProperty()
  createdAt: Date.

  @ApiProperty()
  updatedAt: Date.
}

export class FileCustomsEntryDto {
  @ApiPropertyOptional({ example: 'broker-id' })
  @IsOptional()
  @IsUUID()
  brokerId?: string.

  @ApiPropertyOptional({ example: 'Filed by broker' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string.
}

export class ClearCustomsEntryDto {
  @ApiPropertyOptional({ example: 'Cleared by customs' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string.
}

export class HoldCustomsEntryDto {
  @ApiProperty({ example: 'Missing certificate of origin' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  reason: string.
}

export class ReleaseCustomsEntryDto {
  @ApiPropertyOptional({ example: 'Released after inspection' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string.
}

export class AmendCustomsEntryDto {
  @ApiPropertyOptional({ example: 'CUS-001-A1' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  newCode?: string.

  @ApiPropertyOptional({ enum: CustomsStatus })
  @IsOptional()
  @IsEnum(CustomsStatus)
  newStatus?: CustomsStatus.

  @ApiPropertyOptional({ example: 'Corrected tariff code' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string.
}