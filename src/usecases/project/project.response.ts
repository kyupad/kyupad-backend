import { Project } from '@schemas/project.schema';
import { ApiProperty } from '@nestjs/swagger';
import { withBaseResponse } from '@/interfaces/common.interface';
import { boolean } from 'joi';
import { UsesProjectAssets } from '@/services/user-project/user-project.response';

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

  @ApiProperty({
    type: UsesProjectAssets,
  })
  users_assets?: UsesProjectAssets;
}

class ProjectDetailResponse extends withBaseResponse(ProjectDetailDto, {}) {}

export {
  ProjectDetailResponse,
  ProjectRaffleInfo,
  ProjectDetailDto,
  ProjectDto,
};
