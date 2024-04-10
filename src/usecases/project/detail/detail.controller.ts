import { ProjectService } from '@/services/project/project.service';
import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import {
  GetProjectDetailResponse,
  IApplyProjectResponse,
} from './detail.response';
import { UserProject } from '@/schemas/user_project.schema';
import { ClsService } from 'nestjs-cls';
import { JwtService } from '@nestjs/jwt';

@ApiTags('project')
@Controller()
export class ProjectDetailController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly cls: ClsService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOkResponse({
    type: GetProjectDetailResponse,
  })
  @Get()
  async getProjectDetail(
    @Param('slug') slug: string,
  ): Promise<GetProjectDetailResponse> {
    const result = await this.projectService.findBySlug(slug);

    if (!result) {
      throw new NotFoundException('Project not found');
    }

    let isApplied = false;

    const accessToken = this.cls.get('accessToken');

    if (accessToken) {
      const userInfo = this.jwtService.decode(accessToken) as any;

      if (userInfo?.sub && result?._id) {
        const isExistApplied = await this.projectService.findUserProject(
          result._id.toString(),
          userInfo.sub,
        );

        if (isExistApplied?.user_id) {
          isApplied = true;
        }
      }
    }

    return {
      statusCode: 200,
      data: { detail: result, is_applied: isApplied },
    };
  }

  // @Post()
  // @ApiParam({ name: 'slug' })
  // async applyProject(
  //   @Body() userProject: UserProject,
  // ): Promise<IApplyProjectResponse> {
  //   const accessToken = this.cls.get('accessToken');
  //
  //   if (!accessToken) {
  //     throw new NotFoundException('Please login first');
  //   }
  //
  //   const userInfo = this.jwtService.decode(accessToken) as any;
  //
  //   if (!userInfo) {
  //     throw new NotFoundException('User not found');
  //   }
  //
  //   const isExistApplied = await this.projectService.findUserProject(
  //     userProject.project_id,
  //     userInfo.sub,
  //   );
  //
  //   if (isExistApplied?.user_id) {
  //     throw new NotFoundException('You have been applied this project');
  //   }
  //
  //   const payload: UserProject = {
  //     is_applied: true,
  //     project_id: userProject.project_id,
  //     user_id: userInfo.sub,
  //   };
  //
  //   await this.projectService.createUserProject(payload);
  //
  //   return {
  //     statusCode: 201,
  //     data: true,
  //   };
  // }

  @Post()
  @ApiParam({ name: 'slug' })
  async applyProjectMock(
    @Body() userProject: UserProject,
  ): Promise<IApplyProjectResponse> {
    const userInfo = {
      sub: userProject.user_id,
    };

    const isExistApplied = await this.projectService.findUserProject(
      userProject.project_id,
      userInfo.sub,
    );

    if (isExistApplied?.user_id) {
      throw new NotFoundException('You have been applied this project');
    }

    const payload: UserProject = {
      is_applied: true,
      project_id: userProject.project_id,
      user_id: userInfo.sub,
    };

    await this.projectService.createUserProject(payload);

    return {
      statusCode: 201,
      data: true,
    };
  }
}
