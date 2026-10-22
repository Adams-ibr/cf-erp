import { IsString, IsOptional, IsUUID, IsBoolean, MinLength, MaxLength, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum AddressType {
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  REGISTERED = 'REGISTERED',
  WAREHOUSE = 'WAREHOUSE',
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
  OTHER = 'OTHER',
}

export class CreateAddressDto {
  @ApiProperty({ enum: AddressType, example: AddressType.BILLING })
  @IsEnum(AddressType)
  type: AddressType;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  line1: string;

  @ApiPropertyOptional({ example: 'Suite 100' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  line2?: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  postalCode: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  country: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: 'customer-id' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'warehouse-id' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ enum: AddressType })
  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;

  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  line1?: string;

  @ApiPropertyOptional({ example: 'Suite 100' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  line2?: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CoordinatesDto {
  @ApiProperty({ example: 40.7128 })
  @IsString()
  latitude: string;

  @ApiProperty({ example: -74.0060 })
  @IsString()
  longitude: string;
}

export class AddressQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AddressType })
  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;

  @ApiPropertyOptional({ example: 'customer-id' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'warehouse-id' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;
}

export class AddressResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: AddressType })
  type: AddressType;

  @ApiProperty()
  line1: string;

  @ApiPropertyOptional()
  line2?: string;

  @ApiProperty()
  city: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  country: string;

  @ApiPropertyOptional()
  coordinates?: { latitude: number; longitude: number };

  @ApiProperty()
  isDefault: boolean;

  @ApiPropertyOptional()
  customerId?: string;

  @ApiPropertyOptional()
  supplierId?: string;

  @ApiPropertyOptional()
  warehouseId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}