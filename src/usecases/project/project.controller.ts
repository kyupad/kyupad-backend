import { EProjectType } from '@/enums';
import { ProjectService } from '@/services/project/project.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiQuery,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ListProjectQuery,
  ListProjectResponse,
  ListProjectResult,
  ProjectApplyBody,
  ProjectApplyMockBody,
  ProjectApplyResponse,
} from './project.type';
import { ClsService } from 'nestjs-cls';
import { JwtService } from '@nestjs/jwt';
import { UserProjectService } from '@/services/user-project/user-project.service';
import { plainToInstance } from 'class-transformer';
import { Project } from '@schemas/project.schema';
import {
  ProjectDetailDto,
  ProjectDetailResponse,
  ProjectDto,
} from '@usecases/project/project.response';

@Controller()
@ApiTags('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly cls: ClsService,
    private readonly jwtService: JwtService,
    private readonly userProjectService: UserProjectService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List Project' })
  @ApiOkResponse({
    type: ListProjectResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiQuery({ enum: EProjectType, name: 'type', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  async list(@Query() query: ListProjectQuery): Promise<ListProjectResponse> {
    if (!query?.type) {
      throw new BadRequestException('type is required');
    }

    if (
      query?.type !== EProjectType.success &&
      query?.type !== EProjectType.upcoming
    ) {
      throw new BadRequestException('type is invalid');
    }

    if (query?.type === EProjectType.success) {
      const success = await this.projectService.listSuccess({
        limit: query?.limit,
        skip: query?.skip,
      });
      const r = [...JSON.parse(JSON.stringify(success))];
      const result = plainToInstance(
        Project,
        r,
      ) as unknown as ListProjectResult[];
      return {
        statusCode: 200,
        data: result,
      };
    }

    if (query?.type === EProjectType.upcoming) {
      const upcoming = await this.projectService.listUpcoming({
        limit: query?.limit,
        skip: query?.skip,
      });

      const r = [...JSON.parse(JSON.stringify(upcoming))];

      const result = plainToInstance(
        Project,
        r,
      ) as unknown as ListProjectResult[];
      return {
        statusCode: 200,
        data: result,
      };
    }

    return {
      statusCode: 200,
      data: [],
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Detail Project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiOkResponse({ type: ProjectDetailResponse })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async detail(@Param('slug') slug: string): Promise<ProjectDetailResponse> {
    const accessToken = this.cls.get('accessToken');
    let wallet;

    if (accessToken) {
      const userInfo = this.jwtService.decode(accessToken) as any;
      wallet = userInfo?.sub;
    }
    const { project, is_applied } = await this.projectService.detail(
      slug,
      wallet,
    );

    return {
      statusCode: HttpStatus.OK,
      data: {
        project: plainToInstance(
          ProjectDto,
          JSON.parse(JSON.stringify(project)),
        ),
        is_applied,
      },
    };
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply Project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiCreatedResponse({ type: ProjectApplyResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async apply(@Body() body: ProjectApplyBody): Promise<ProjectApplyResponse> {
    const project_id = body?.project_id;

    if (!project_id) {
      throw new BadRequestException('project_id is required');
    }

    const accessToken = this.cls.get('accessToken');

    if (!accessToken) {
      throw new UnauthorizedException('Please login to apply project');
    }

    const userInfo = this.jwtService.decode(accessToken) as any;

    if (userInfo?.sub) {
      await this.userProjectService.create({
        project_id,
        user_id: userInfo.sub,
        is_applied: true,
      });
    }

    return {
      statusCode: HttpStatus.CREATED,
      data: [{ project_id }],
    };
  }

  @Post('/registration/mock')
  @ApiOperation({ summary: 'Apply Project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiCreatedResponse({ type: ProjectApplyResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async mockApply(
    @Body() body: ProjectApplyMockBody,
  ): Promise<ProjectApplyResponse> {
    const project_id = body?.project_id;

    if (!project_id) {
      throw new BadRequestException('project_id is required');
    }

    const isExistProject = await this.projectService.isExist(project_id);

    if (!isExistProject) {
      throw new NotFoundException('Project not found');
    }

    // const accessToken = this.cls.get('accessToken');
    //
    // if (!accessToken) {
    //   throw new UnauthorizedException('Please login to apply project');
    // }
    //
    // const userInfo = this.jwtService.decode(accessToken) as any;

    await this.userProjectService.create({
      project_id,
      user_id: body.user_id || 'NONE',
      is_applied: true,
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: [{ project_id }],
    };
  }
}
