import { ProjectService } from '@/services/project/project.service';
import { Controller, Get, Query } from '@nestjs/common';
import { GetProjectsResponse } from './list.response';
import { ApiTags, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { ProjectTime } from './list.type';

@ApiTags('project')
@Controller()
export class ProjectListController {
  constructor(private readonly projectsService: ProjectService) {}

  @ApiOkResponse({
    type: GetProjectsResponse,
    description: 'List of project.',
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
