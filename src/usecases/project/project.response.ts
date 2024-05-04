import { Project } from '@schemas/project.schema';
import { ApiProperty } from '@nestjs/swagger';
import { withBaseResponse } from '@/interfaces/common.interface';
import { UsesProjectAssets } from '@/services/user-project/user-project.response';
import { EProjectProgressStatus } from '@/enums';

class UserProjectInvestmentInfo {
  @ApiProperty({
    type: Number,
  })
  total_owner_winning_tickets: number;

  @ApiProperty({
    type: Number,
  })
  tickets_used: number;

  @ApiProperty({
    type: Number,
  })
  total_winner: number;

  @ApiProperty({
    type: Number,
  })
  ticket_size: number;

  @ApiProperty({
    default: 'USDT',
  })
  currency?: string;

  @ApiProperty({
    type: Number,
  })
  token_offered: number;
}

class ProjectDetailDto {
  @ApiProperty({
    enum: EProjectProgressStatus,
  })
  progress_status: EProjectProgressStatus;

  @ApiProperty({
    type: Boolean,
  })
  is_applied?: boolean;

  @ApiProperty({
    type: Project,
  })
  project: Project;

  @ApiProperty({
    type: UsesProjectAssets,
  })
  users_assets?: UsesProjectAssets;
}

class ProjectDetailResponse extends withBaseResponse(ProjectDetailDto, {}) {}

class UserProjectCatnipInfo {
  @ApiProperty({
    type: Number,
  })
  catnip_point: number;

  @ApiProperty({
    type: Number,
  })
  multi_pier?: number;
}

class UserProjectRegistrationDto {
  @ApiProperty({
    enum: EProjectProgressStatus,
  })
  progress_status: EProjectProgressStatus;

  @ApiProperty({
    type: Project,
  })
  project_info: Partial<Project>;

  @ApiProperty({
    required: false,
    type: UserProjectCatnipInfo,
  })
  catnip_info?: UserProjectCatnipInfo;

  @ApiProperty({
    required: false,
    type: UserProjectCatnipInfo,
  })
  investment_info?: UserProjectInvestmentInfo;

  @ApiProperty({
    type: UsesProjectAssets,
    required: false,
  })
  users_assets?: UsesProjectAssets;
}

class UserProjectRegistrationResponse extends withBaseResponse(
  UserProjectRegistrationDto,
  {},
) {}

export {
  ProjectDetailResponse,
  ProjectDetailDto,
  UserProjectRegistrationDto,
  UserProjectRegistrationResponse,
};
