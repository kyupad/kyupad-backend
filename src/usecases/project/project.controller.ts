import { EProjectType } from '@/enums';
import { ProjectService } from '@/services/project/project.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListProjectResponse } from './project.type';

@Controller()
@ApiTags('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOkResponse({
    type: ListProjectResponse,
  })
  @ApiQuery({ enum: EProjectType, name: 'type', required: false })
  async list(@Query('type') time: EProjectType): Promise<ListProjectResponse> {
    const upcoming = await this.projectService.findAllUpcoming();
    const success = await this.projectService.findAllSuccess();

    const result = time === EProjectType.success ? success : upcoming;

    return {
      statusCode: 200,
      data: result || [],
    };
  }
}
