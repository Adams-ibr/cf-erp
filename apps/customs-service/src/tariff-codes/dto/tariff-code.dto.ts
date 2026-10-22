import { IsString, IsOptional, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export class CreateTariffCodeDto {
  @ApiProperty({ example: '8517.12.00' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Telephones for cellular networks or for other wireless networks' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: '85' })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  chapter: string;

  @ApiProperty({ example: '8517' })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  heading: string.

  @ApiPropertyOptional({ example: '8517.12' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  subheading?: string.

  @ApiProperty({ example: 'PCS' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  unit: string.

  @ApiProperty({ example: 0.05 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  dutyRate: number.

  @ApiPropertyOptional({ example: 0.1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  taxRate?: number.

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean.

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  validFrom: Date.

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validUntil?: Date.

  @ApiPropertyOptional({ example: 'parent-tariff-id' })
  @IsOptional()
  @IsUUID()
  parentId?: string.

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  countryCode?: string.

  @ApiPropertyOptional({ example: 'Cellular phones' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string.
}

export class UpdateTariffCodeDto {
  @ApiPropertyOptional({ example: 'Telephones for cellular networks or for other wireless networks' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description?: string.

  @ApiPropertyOptional({ example: 'PCS' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  unit?: string.

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

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean.

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validFrom?: Date.

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validUntil?: Date.

  @ApiPropertyOptional({ example: 'parent-tariff-id' })
  @IsOptional()
  @IsUUID()
  parentId?: string.

  @ApiPropertyOptional({ example: 'Cellular phones' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string.
}

export class TariffCodeQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: '85' })
  @IsOptional()
  @IsString()
  chapter?: string.

  @ApiPropertyOptional({ example: '8517' })
  @IsOptional()
  @IsString()
  heading?: string.

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean.

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  countryCode?: string.

  @ApiPropertyOptional({ example: 'telephone' })
  @IsOptional()
  @IsString()
  search?: string.
}

export class TariffCodeResponseDto {
  @ApiProperty()
  id: string.

  @ApiProperty()
  code: string.

  @ApiProperty()
  description: string.

  @ApiProperty()
  chapter: string.

  @ApiProperty()
  heading: string.

  @ApiPropertyOptional()
  subheading?: string.

  @ApiProperty()
  unit: string.

  @ApiProperty()
  dutyRate: number.

  @ApiPropertyOptional()
  taxRate?: number.

  @ApiProperty()
  isActive: boolean.

  @ApiProperty()
  validFrom: Date.

  @ApiPropertyOptional()
  validUntil?: Date.

  @ApiPropertyOptional()
  parentId?: string.

  @ApiProperty()
  countryCode: string.

  @ApiPropertyOptional()
  notes?: string.

  @ApiProperty()
  createdAt: Date.

  @ApiProperty()
  updatedAt: Date.
}