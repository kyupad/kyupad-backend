import { ProjectService } from '@/services/project/project.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateProjectDto,
  CreateProjectResponse,
  DeleteProjectDto,
  GetProjectsResponse,
  UpdateProjectDto,
  UpdateProjectResponse,
} from './project.type';
import { isEmpty } from '@/helpers';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ProjectSalePool, ProjectVestingType } from '@/constants';
dayjs.extend(utc);

@ApiTags('admin')
@Controller()
export class AdminProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'The project has been successfully created.',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request.',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error.',
  })
  @ApiBody({ type: CreateProjectDto })
  @ApiOperation({ summary: 'Launching a new project' })
  @Post()
  async create(
    @Body() project: CreateProjectDto,
  ): Promise<CreateProjectResponse> {
    if (!project.name) {
      throw new BadRequestException('name is required');
    }

    if (!project.slug) {
      throw new BadRequestException('slug is required');
    }

    if (!project.token_info.symbol) {
      throw new BadRequestException('symbol is required');
    }

    if (!project.logo) {
      throw new BadRequestException('logo is required');
    }

    if (!project.thumbnail) {
      throw new BadRequestException('thumbnail is required');
    }

    if (!project.short_description) {
      throw new BadRequestException('short_description is required');
    }

    if (!project.info.total_raise) {
      throw new BadRequestException('total_raise is required');
    }

    if (!project.info.ticket_size) {
      throw new BadRequestException('ticket_size is required');
    }

    if (!project.info.sale_pool) {
      throw new BadRequestException('sale_pool is required');
    }

    if (!project.timeline.registration_start_at) {
      throw new BadRequestException('registration_start_at is required');
    }

    if (!project.timeline.registration_end_at) {
      throw new BadRequestException('registration_end_at is required');
    }

    if (!project.timeline.snapshot_start_at) {
      throw new BadRequestException('snapshot_start_at is required');
    }

    if (!project.timeline.snapshot_end_at) {
      throw new BadRequestException('snapshot_end_at is required');
    }

    if (!project.timeline.investment_start_at) {
      throw new BadRequestException('investment_start_at is required');
    }

    if (!project.timeline.investment_end_at) {
      throw new BadRequestException('investment_end_at is required');
    }

    if (!project.timeline.claim_start_at) {
      throw new BadRequestException('claim_start_at is required');
    }

    if (!project.info.token_offered) {
      throw new BadRequestException('token_offered is required');
    }

    if (!project.token_info.address) {
      throw new BadRequestException('address is required');
    }

    if (!project.token_info.initial_market_cap) {
      throw new BadRequestException('initial_market_cap is required');
    }

    if (!project.token_info.vesting_type) {
      throw new BadRequestException('vesting_type is required');
    }

    if (!project.token_info.vesting_schedule) {
      throw new BadRequestException('vesting_schedule is required');
    }

    if (!project.token_info.token_distribute_time) {
      throw new BadRequestException('token_distribute_time is required');
    }

    if (!project.price.amount) {
      throw new BadRequestException('amount is required');
    }

    if (!project.price.currency) {
      throw new BadRequestException('currency is required');
    }

    if (isEmpty(project.assets.nft)) {
      throw new BadRequestException('nft is required');
    }

    if (isEmpty(project.assets.token)) {
      throw new BadRequestException('token is required');
    }

    if (project.info.total_raise <= 0) {
      throw new BadRequestException('total_raise must be greater than 0');
    }

    if (project.info.ticket_size <= 0) {
      throw new BadRequestException('ticket_size must be greater than 0');
    }

    if (project.info.sale_pool !== ProjectSalePool.Subscription) {
      throw new BadRequestException('sale_pool must be Subscription');
    }

    if (project.info.token_offered <= 0) {
      throw new BadRequestException('token_offered must be greater than 0');
    }

    if (project.token_info.initial_market_cap <= 0) {
      throw new BadRequestException(
        'initial_market_cap must be greater than 0',
      );
    }

    if (project.token_info.vesting_type !== ProjectVestingType.Milestone) {
      throw new BadRequestException('vesting_type must be Milestone');
    }

    if (project.price.amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }

    const now = dayjs.utc();

    if (
      dayjs
        .utc(dayjs.unix(project.timeline.registration_start_at))
        .isBefore(now)
    ) {
      throw new BadRequestException(
        'registration_start_at must be greater than now',
      );
    }

    if (
      dayjs
        .utc(dayjs.unix(project.timeline.registration_end_at))
        .isBefore(
          dayjs.utc(dayjs.unix(project.timeline.registration_start_at)),
        ) ||
      dayjs
        .utc(dayjs.unix(project.timeline.registration_end_at))
        .isSame(dayjs.utc(dayjs.unix(project.timeline.registration_start_at)))
    ) {
      throw new BadRequestException(
        'registration_end_at must be greater than registration_start_at',
      );
    }

    if (
      dayjs
        .utc(dayjs.unix(project.timeline.snapshot_start_at))
        .isBefore(dayjs.utc(dayjs.unix(project.timeline.registration_end_at)))
    ) {
      throw new BadRequestException(
        'snapshot_start_at must be greater than registration_end_at',
      );
    }

    if (
      dayjs
        .utc(dayjs.unix(project.timeline.snapshot_end_at))
        .isBefore(dayjs.utc(dayjs.unix(project.timeline.snapshot_start_at))) ||
      dayjs
        .utc(dayjs.unix(project.timeline.snapshot_end_at))
        .isSame(dayjs.utc(dayjs.unix(project.timeline.snapshot_start_at)))
    ) {
      throw new BadRequestException(
        'snapshot_end_at must be greater than snapshot_start_at',
      );
    }

    if (
      dayjs
        .utc(dayjs.unix(project.timeline.investment_start_at))
        .isBefore(dayjs.utc(dayjs.unix(project.timeline.snapshot_end_at)))
    ) {
      throw new BadRequestException(
        'investment_start_at must be greater than snapshot_end_at',
      );
    }

    if (
      dayjs
        .utc(dayjs.unix(project.timeline.investment_end_at))
        .isBefore(
          dayjs.utc(dayjs.unix(project.timeline.investment_start_at)),
        ) ||
      dayjs
        .utc(dayjs.unix(project.timeline.investment_end_at))
        .isSame(dayjs.utc(dayjs.unix(project.timeline.investment_start_at)))
    ) {
      throw new BadRequestException(
        'investment_end_at must be greater than investment_start_at',
      );
    }

    if (
      dayjs
        .utc(dayjs.unix(project.timeline.claim_start_at))
        .isBefore(dayjs.utc(dayjs.unix(project.timeline.investment_end_at)))
    ) {
      throw new BadRequestException(
        'claim_start_at must be greater than investment_end_at',
      );
    }

    const isExist = await this.projectService.findBySlug(project.slug);

    if (isExist?._id) {
      throw new BadRequestException('slug is already exist');
    }

    const newProject: any = {
      ...project,
      slug: project.slug.toLowerCase(),
    };

    newProject.timeline.registration_start_at = dayjs
      .utc(dayjs.unix(project.timeline.registration_start_at))
      .toDate();
    newProject.timeline.registration_end_at = dayjs
      .utc(dayjs.unix(project.timeline.registration_end_at))
      .toDate();

    newProject.timeline.snapshot_start_at = dayjs
      .utc(dayjs.unix(project.timeline.snapshot_start_at))
      .toDate();
    newProject.timeline.snapshot_end_at = dayjs
      .utc(dayjs.unix(project.timeline.snapshot_end_at))
      .toDate();
    newProject.timeline.investment_start_at = dayjs
      .utc(dayjs.unix(project.timeline.investment_start_at))
      .toDate();
    newProject.timeline.investment_end_at = dayjs
      .utc(dayjs.unix(project.timeline.investment_end_at))
      .toDate();
    newProject.timeline.claim_start_at = dayjs
      .utc(dayjs.unix(project.timeline.claim_start_at))
      .toDate();
    newProject.token_info.token_distribute_time = dayjs
      .utc(dayjs.unix(project.token_info.token_distribute_time))
      .toDate();

    const result = await this.projectService.create(newProject);

    return {
      statusCode: HttpStatus.CREATED,
      data: result,
    };
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The project has been successfully updated.',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Required least one field to update',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error.',
  })
  @ApiBody({ type: UpdateProjectDto })
  @ApiOperation({ summary: 'Update project' })
  @ApiParam({ name: 'id' })
  @Patch(':id')
  async update(
    @Body() project: UpdateProjectDto,
    @Param('id') id: string,
  ): Promise<UpdateProjectResponse> {
    if (isEmpty(project)) {
      throw new BadRequestException('Required least one field to update');
    }

    const newProject: any = {
      ...project,
    };

    if (project.timeline?.registration_start_at) {
      newProject.timeline.registration_start_at = dayjs
        .utc(dayjs.unix(project.timeline.registration_start_at))
        .toDate();
    }

    if (project.timeline?.registration_end_at) {
      newProject.timeline.registration_end_at = dayjs
        .utc(dayjs.unix(project.timeline.registration_end_at))
        .toDate();
    }

    if (project.timeline?.snapshot_start_at) {
      newProject.timeline.snapshot_start_at = dayjs
        .utc(dayjs.unix(project.timeline.snapshot_start_at))
        .toDate();
    }

    if (project.timeline?.snapshot_end_at) {
      newProject.timeline.snapshot_end_at = dayjs
        .utc(dayjs.unix(project.timeline.snapshot_end_at))
        .toDate();
    }

    if (project.timeline?.investment_start_at) {
      newProject.timeline.investment_start_at = dayjs
        .utc(dayjs.unix(project.timeline.investment_start_at))
        .toDate();
    }

    if (project.timeline?.investment_end_at) {
      newProject.timeline.investment_end_at = dayjs
        .utc(dayjs.unix(project.timeline.investment_end_at))
        .toDate();
    }

    if (project.timeline?.claim_start_at) {
      newProject.timeline.claim_start_at = dayjs
        .utc(dayjs.unix(project.timeline.claim_start_at))
        .toDate();
    }

    if (project.token_info?.token_distribute_time) {
      newProject.token_info.token_distribute_time = dayjs
        .utc(dayjs.unix(project.token_info.token_distribute_time))
        .toDate();
    }

    const result = await this.projectService.update(id, newProject);
    return {
      statusCode: HttpStatus.CREATED,
      data: result,
    };
  }

  @ApiNoContentResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The project has been successfully updated.',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Required least one id to delete',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error.',
  })
  @ApiBody({ type: DeleteProjectDto })
  @ApiOperation({ summary: 'Delete project' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async delete(@Body() payload: DeleteProjectDto): Promise<void> {
    if (!payload.ids.length) {
      throw new BadRequestException('ids is required');
    }
    await this.projectService.delete(payload.ids);
    return;
  }

  @ApiOkResponse({
    type: GetProjectsResponse,
    description: 'Get projects successfully.',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error.',
  })
  @ApiOperation({ summary: 'Get all projects' })
  @Get()
  async getAll(): Promise<GetProjectsResponse> {
    const result = await this.projectService.findAll();
    return {
      data: result,
      statusCode: HttpStatus.OK,
    };
  }
}
