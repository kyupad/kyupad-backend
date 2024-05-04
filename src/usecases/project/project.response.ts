import { Project } from '@schemas/project.schema';
import { ApiProperty } from '@nestjs/swagger';
import { withBaseResponse } from '@/interfaces/common.interface';
import { boolean } from 'joi';

class ProjectRaffleInfo {
  @ApiProperty({
    type: Number,
  })
  total_owner_winning_tickets: number;

  @ApiProperty({
    type: Number,
  })
  total_winner: number;
}

class ProjectDto extends Project {
  @ApiProperty({
    type: ProjectRaffleInfo,
  })
  raffle_info?: ProjectRaffleInfo;
}

class ProjectDetailDto {
  @ApiProperty({
    type: ProjectDto,
  })
  project: ProjectDto;

  @ApiProperty({
    type: boolean,
  })
  is_applied?: boolean;
}

class ProjectDetailResponse extends withBaseResponse(ProjectDetailDto, {}) {}

export {
  ProjectDetailResponse,
  ProjectRaffleInfo,
  ProjectDetailDto,
  ProjectDto,
};
