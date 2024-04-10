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
} from '@nestjs/common';
import {
  ApiQuery,
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import {
  DetailProjectResponse,
  ListProjectQuery,
  ListProjectResponse,
  ListProjectResult,
  ProjectApplyBody,
  ProjectApplyResponse,
} from './project.type';
import { plainToInstance } from 'class-transformer';
import { Project } from '@/schemas/project.schema';
import { ClsService } from 'nestjs-cls';
import { JwtService } from '@nestjs/jwt';
import { UserProjectService } from '@/services/user-project/user-project.service';

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
      const success = await this.projectService.listSuccess();
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
      const upcoming = await this.projectService.listUpcoming();

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
  @ApiOkResponse({ type: DetailProjectResponse })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async detail(@Param('slug') slug: string): Promise<DetailProjectResponse> {
    const result = await this.projectService.findBySlug(slug);

    if (!result) {
      throw new NotFoundException('Project not found');
    }

    const accessToken = this.cls.get('accessToken');

    if (accessToken) {
      const userInfo = this.jwtService.decode(accessToken) as any;

      if (userInfo?.sub) {
        const isApplied = await this.userProjectService.isApplied(
          userInfo.sub,
          result.id,
        );

        if (isApplied) {
          return {
            statusCode: 200,
            data: {
              project: plainToInstance(
                Project,
                JSON.parse(JSON.stringify(result)),
              ),
              is_applied: isApplied,
            },
          };
        }
      }
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        project: plainToInstance(Project, JSON.parse(JSON.stringify(result))),
        is_applied: false,
      },
    };
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply Project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiCreatedResponse({ type: ProjectApplyResponse })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async apply(@Body() body: ProjectApplyBody): Promise<ProjectApplyResponse> {
    const project_id = body?.project_id;

    if (!project_id) {
      throw new BadRequestException('project_id is required');
    }

    const isExistProject = await this.projectService.isExist(project_id);

    if (!isExistProject) {
      throw new NotFoundException('Project not found');
    }

    const accessToken = this.cls.get('accessToken');

    if (accessToken) {
      const userInfo = this.jwtService.decode(accessToken) as any;

      if (userInfo?.sub) {
        await this.userProjectService.create({
          project_id,
          user_id: userInfo.sub,
        });
      }
    }

    return {
      statusCode: HttpStatus.CREATED,
      data: [{ project_id }],
    };
  }
}
