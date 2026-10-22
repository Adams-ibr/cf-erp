import { IsString, MinLength, MaxLength, IsOptional, IsBoolean, IsEmail, IsUrl, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export class CreateTenantDto {
  @ApiProperty({ example: 'Acme Logistics' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'acme' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[a-z0-9-]+$/, { message: 'Code must contain only lowercase letters, numbers, and hyphens' })
  code: string;

  @ApiPropertyOptional({ example: 'https://acme.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiPropertyOptional({ example: 'acme.com' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ example: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  address?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  contact?: Record<string, unknown>;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Acme Logistics' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'https://acme.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiPropertyOptional({ example: 'acme.com' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ example: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  address?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  contact?: Record<string, unknown>;
}

export class TenantQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'acme' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class TenantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiPropertyOptional()
  logo?: string;

  @ApiPropertyOptional()
  domain?: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  locale: string;

  @ApiProperty()
  dateFormat: string;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional()
  address?: Record<string, unknown>;

  @ApiPropertyOptional()
  contact?: Record<string, unknown>;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}