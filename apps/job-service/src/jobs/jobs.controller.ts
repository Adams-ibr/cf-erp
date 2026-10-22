import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto, JobResponseDto } from './dto/job.dto';

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Permissions('jobs.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create job' })
  @ApiResponse({ status: 201, description: 'Job created', type: JobResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createJobDto: CreateJobDto,
  ) {
    return this.jobsService.create(tenantId, branchId, userId, createJobDto);
  }

  @Get()
  @Permissions('jobs.read')
  @ApiOperation({ summary: 'List jobs' })
  @ApiResponse({ status: 200, description: 'Jobs list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: JobQueryDto,
  ) {
    return this.jobsService.findAll(tenantId, branchId, query);
  }

  @Get('stats')
  @Permissions('jobs.read')
  @ApiOperation({ summary: 'Get job statistics' })
  @ApiResponse({ status: 200, description: 'Job statistics' })
  async getStats(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
  ) {
    return this.jobsService.getStats(tenantId, branchId);
  }

  @Get(':id')
  @Permissions('jobs.read')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({ status: 200, description: 'Job details', type: JobResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.jobsService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('jobs.update')
  @ApiOperation({ summary: 'Update job' })
  @ApiResponse({ status: 200, description: 'Job updated', type: JobResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(tenantId, id, userId, updateJobDto);
  }

  @Delete(':id')
  @Permissions('jobs.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete job' })
  @ApiResponse({ status: 200, description: 'Job deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.jobsService.delete(tenantId, id, userId);
    return { message: 'Job deleted successfully' };
  }

  @Put(':id/status')
  @Permissions('jobs.update_status')
  @ApiOperation({ summary: 'Update job status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.jobsService.updateStatus(tenantId, id, userId, body.status, body.notes);
  }

  @Post(':id/legs')
  @Permissions('jobs.update')
  @ApiOperation({ summary: 'Add leg to job' })
  @ApiResponse({ status: 201, description: 'Leg added' })
  async addLeg(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { sequence: number; type: string; mode: string; origin: string; destination: string; carrierId?: string; vesselId?: string; voyageId?: string; etd?: Date; eta?: Date },
  ) {
    return this.jobsService.addLeg(tenantId, id, userId, body);
  }

  @Delete(':id/legs/:legId')
  @Permissions('jobs.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove leg from job' })
  @ApiResponse({ status: 200, description: 'Leg removed' })
  async removeLeg(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('legId') legId: string,
  ) {
    await this.jobsService.removeLeg(tenantId, id, legId, userId);
    return { message: 'Leg removed successfully' };
  }
}