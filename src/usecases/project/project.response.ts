import { Project } from '@schemas/project.schema';
import { ApiProperty } from '@nestjs/swagger';
import { withBaseResponse } from '@/interfaces/common.interface';
import { UsesProjectAssets } from '@/services/user-project/user-project.response';
import {
  EAmountPeriodType,
  EProjectParticipationStatus,
  EProjectProgressStatus,
  EProjectUserAssetType,
  EProjectVestingType,
} from '@/enums';
import { Transform } from 'class-transformer';

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
  currency: string;

  @ApiProperty({
    type: Number,
  })
  token_offered: number;

  @ApiProperty({
    type: String,
  })
  destination_wallet?: string;

  @ApiProperty({
    type: String,
  })
  merkle_root?: string;

  @ApiProperty({
    type: String,
  })
  currency_address?: string;

  @ApiProperty({
    type: String,
  })
  merkle_proof?: string;

  @ApiProperty({
    type: Boolean,
  })
  is_active?: boolean;

  @ApiProperty({
    type: Boolean,
  })
  is_invested?: boolean;
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

  @ApiProperty({
    type: String,
    required: false,
  })
  notification_email?: string;
}

class ProjectDetailResponse extends withBaseResponse(ProjectDetailDto, {}) {}

class AssetCatnipInfoChild {
  @ApiProperty({
    type: String,
  })
  address?: string;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: String,
  })
  symbol: string;

  @ApiProperty({
    type: Number,
  })
  multi_pier?: number;

  @ApiProperty({
    type: String,
  })
  @Transform(({ value }) => {
    if (value)
      return value.replace('s3://', `${process.env.AWS_S3_BUCKET_URL}/`);
  })
  icon: string;
}

class AssetCatnipInfo {
  @ApiProperty({
    enum: EProjectUserAssetType,
  })
  asset_type: EProjectUserAssetType;

  @ApiProperty({
    type: AssetCatnipInfoChild,
    isArray: true,
  })
  assets?: AssetCatnipInfoChild[];
}

class UserProjectCatnipInfo {
  @ApiProperty({
    type: Number,
  })
  catnip_point: number;

  @ApiProperty({
    type: Number,
  })
  multi_pier?: number;

  @ApiProperty({
    type: Number,
  })
  total_assets: number;

  @ApiProperty({
    type: Boolean,
  })
  is_snapshoting?: boolean;

  @ApiProperty({
    type: AssetCatnipInfo,
    isArray: true,
  })
  assets_catnip_info?: AssetCatnipInfo[];
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
    type: UserProjectInvestmentInfo,
  })
  investment_info?: UserProjectInvestmentInfo;

  @ApiProperty({
    type: UsesProjectAssets,
    required: false,
  })
  users_assets?: UsesProjectAssets;
}

class MyInvestedDto {
  @ApiProperty({ type: String, required: true })
  project_id: string;

  @ApiProperty({ type: String, required: true })
  project_slug: string;

  @ApiProperty({ type: String, required: true })
  @Transform(({ value }) => {
    if (value)
      return value.replace('s3://', `${process.env.AWS_S3_BUCKET_URL}/`);
  })
  project_logo: string;

  @ApiProperty({ type: String, required: true })
  project_name: string;

  @ApiProperty({ type: String, required: true })
  token: string;

  @ApiProperty({ type: Number, required: true })
  invested_amount: number;

  @ApiProperty({ type: Boolean, default: false })
  claim_available: boolean;
}

class MyRegisteredDto {
  @ApiProperty({ type: String, required: true })
  project_id: string;

  @ApiProperty({ type: String, required: true })
  project_slug: string;

  @ApiProperty({ type: String, required: true })
  project_name: string;

  @ApiProperty({ type: String, required: true })
  @Transform(({ value }) => {
    if (value)
      return value.replace('s3://', `${process.env.AWS_S3_BUCKET_URL}/`);
  })
  project_logo: string;

  @ApiProperty({ type: String, required: true })
  token: string;

  @ApiProperty({
    enum: EProjectParticipationStatus,
    default: EProjectParticipationStatus.ONGOING,
  })
  project_participation_status: EProjectParticipationStatus;
}

class MyInvestmentAsset {
  @ApiProperty({ type: Number, required: true })
  total_assets: number;

  @ApiProperty({ type: AssetCatnipInfo, isArray: true })
  assets_info: AssetCatnipInfo[];
}

class MyInvestmentDetail {
  @ApiProperty({ type: MyInvestmentAsset, required: false })
  my_assets?: MyInvestmentAsset;

  @ApiProperty({ type: MyInvestedDto, required: false, isArray: true })
  my_invested?: MyInvestedDto[];

  @ApiProperty({ type: MyInvestedDto, required: false, isArray: true })
  my_registered?: MyRegisteredDto[];
}

class UserProjectVestingDto extends Project {
  @ApiProperty({ type: Number, required: false })
  tge_amount?: number;
  @ApiProperty({ enum: EAmountPeriodType, required: false })
  tge_type?: EAmountPeriodType;
  @ApiProperty({ type: Number, required: true })
  invested_total: number;
  @ApiProperty({ type: String, required: true })
  invested_currency: string;
  @ApiProperty({ type: Number, required: true })
  vesting_total: number;
  @ApiProperty({ type: String, required: true })
  vesting_token_symbol: string;
  @ApiProperty({ type: String, required: true })
  vesting_token: string;
  @ApiProperty({ enum: EProjectVestingType, required: true })
  vesting_type: EProjectVestingType;
}

class VestingStreamScheduleDto {
  @ApiProperty({ type: String, required: true })
  vesting_time: string;
  @ApiProperty({ type: Number, required: true })
  vesting_total: number;
  @ApiProperty({ type: String, required: true })
  vesting_token_symbol: string;
  @ApiProperty({ type: String, required: false })
  vesting_tx?: string;
}

class VestingStreamDto {
  @ApiProperty({ type: Boolean, default: false })
  is_active?: boolean;
  @ApiProperty({ type: Boolean, default: false })
  is_tge: boolean;
  @ApiProperty({ type: String, required: true })
  stream_id: string;
  @ApiProperty({ type: String, required: true })
  project__id: string;
  @ApiProperty({ type: String, required: true })
  token: string;
  @ApiProperty({ type: String, required: true })
  sender: string;
  @ApiProperty({ type: String, required: true })
  recipient: string;
  @ApiProperty({ type: Number, required: true })
  period?: number;
  @ApiProperty({ type: String, required: true })
  start_at: string;
  @ApiProperty({ type: String, required: true })
  end_at: string;
  @ApiProperty({ type: Number, required: true })
  amount_per_period?: number;
  @ApiProperty({ type: Number, required: true })
  total_amount: number;
  @ApiProperty({ type: Number, required: true })
  released_amount?: number;
  @ApiProperty({ type: Number, required: true })
  available_amount?: number;
  @ApiProperty({ type: Number, required: true })
  withdrawn_amount?: number;
  @ApiProperty({ type: String, required: false })
  last_withdrawn_at?: string;
  @ApiProperty({
    type: VestingStreamScheduleDto,
    required: true,
    isArray: true,
  })
  vesting_schedule?: VestingStreamScheduleDto[];
}

class MyVestingDto {
  @ApiProperty({ type: UserProjectVestingDto, required: true })
  project_vesting: Partial<UserProjectVestingDto>;
  @ApiProperty({ type: VestingStreamDto, required: false })
  vesting_pool?: VestingStreamDto;
}

class UserProjectRegistrationResponse extends withBaseResponse(
  UserProjectRegistrationDto,
  {},
) {}

class GenerateInvestingOffChainIdDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  id: string;
}

class GenerateInvestingOffChainIdResponse extends withBaseResponse(
  GenerateInvestingOffChainIdDto,
  {},
) {}

class MyInvestedResponse extends withBaseResponse(MyInvestmentDetail, {
  isArray: false,
}) {}

class MyVestingResponse extends withBaseResponse(MyVestingDto, {
  isArray: false,
}) {}

export {
  ProjectDetailResponse,
  ProjectDetailDto,
  UserProjectRegistrationDto,
  UserProjectRegistrationResponse,
  AssetCatnipInfo,
  AssetCatnipInfoChild,
  GenerateInvestingOffChainIdResponse,
  GenerateInvestingOffChainIdDto,
  MyInvestedDto,
  MyInvestedResponse,
  MyInvestmentDetail,
  MyInvestmentAsset,
  MyRegisteredDto,
  MyVestingDto,
  VestingStreamDto,
  MyVestingResponse,
  UserProjectVestingDto,
  VestingStreamScheduleDto,
};
