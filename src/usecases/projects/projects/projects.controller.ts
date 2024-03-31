import { ProjectService } from '@/services/project/project.service';
import { Project } from '@/schemas/project.schema';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { FindAllUpcomingLaunchesResponse } from './projects.response';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectService) {}

  @Post()
  async create(@Body() project: Project): Promise<void> {
    await this.projectsService.create(project);
  }

  @Get()
  async findAllUpcomingLaunches(): Promise<FindAllUpcomingLaunchesResponse> {
    const result = await this.projectsService.findAllUpcomingLaunches();

    return {
      statusCode: 200,
      data: result,
    };
  }
}
