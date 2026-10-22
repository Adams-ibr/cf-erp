import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, ActivityQueryDto, ActivityResponseDto } from './dto/activity.dto';

@ApiTags('Activities')
@Controller('activities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @Permissions('activities.create')
  @ApiOperation({ summary: 'Create activity' })
  @ApiResponse({ status: 201, description: 'Activity created', type: ActivityResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Body() createActivityDto: CreateActivityDto,
  ) {
    return this.activitiesService.create(tenantId, userId, createActivityDto);
  }

  @Get()
  @Permissions('activities.read')
  @ApiOperation({ summary: 'List activities' })
  @ApiResponse({ status: 200, description: 'Activities list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() query: ActivityQueryDto,
  ) {
    return this.activitiesService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('activities.read')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiResponse({ status: 200, description: 'Activity details', type: ActivityResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.activitiesService.findById(tenantId, id);
  }
}