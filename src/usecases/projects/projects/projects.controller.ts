import { ProjectService } from '@/services/project/project.service';
import { Project } from '@/schemas/project.schema';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GetProjectsResponse } from './projects.response';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectTime } from './projects.type';

@ApiTags('projects')
@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectService) {}

  @ApiCreatedResponse({
    description: 'The project has been successfully created.',
  })
  @Post()
  async create(@Body() project: Project): Promise<void> {
    await this.projectsService.create(project);
  }

  @ApiOkResponse({
    type: GetProjectsResponse,
    description: 'List of upcoming launches.',
  })
  @ApiQuery({ enum: ProjectTime, name: 'time', required: false })
  @Get()
  async getProjects(
    @Query('time') time: ProjectTime,
  ): Promise<GetProjectsResponse> {
    const upcoming = await this.projectsService.findAllUpcoming();
    const success = await this.projectsService.findAllSuccess();

    const result = time === ProjectTime.success ? success : upcoming;

    return {
      statusCode: 200,
      data: result || [],
    };
  }
}
