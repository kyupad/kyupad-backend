import { Project } from '@/schemas/project.schema';
import { ProjectService } from '@/services/project/project.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@Controller()
export class AdminProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @ApiCreatedResponse({
    description: 'The project has been successfully created.',
  })
  @Post()
  async create(@Body() project: Project): Promise<void> {
    await this.projectService.create(project);
  }
}
