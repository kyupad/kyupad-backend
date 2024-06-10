import {
  PaginationResponse,
  withBaseResponse,
} from '@/interfaces/common.interface';
import { Project } from '@/schemas/project.schema';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { EProjectType, EProjectVestingType } from '@/enums';
import { Prop } from '@nestjs/mongoose';
import { string } from 'joi';
import { IsEmail, IsOptional, IsString } from 'class-validator';

dayjs.extend(utc);

export class Timeline {
  @ApiProperty({ required: true, default: dayjs.utc().add(1, 'day').toDate() })
  registration_start_at: Date;

  @ApiProperty({ required: true, default: dayjs.utc().add(2, 'day').toDate() })
  registration_end_at: Date;

  @ApiProperty({
    required: false,
    default:
      'Participants must have at least $200 USDT tokens (Solana Chain) in their connected wallet. The more you engage on socials, the greater the chances of winning. Create an account to make the checkout process during the lottery phase smoother.',
  })
  registration_description?: string;

  @ApiProperty({ required: true, default: dayjs.utc().add(3, 'day').toDate() })
  snapshot_start_at: Date;

  @ApiProperty({ required: true, default: dayjs.utc().add(4, 'day').toDate() })
  snapshot_end_at: Date;

  @ApiProperty({
    required: false,
    default: `
    <ul class="pl-4 font-medium"><li class="list-disc">Hold min. $200 USDT tokens (Solana Chain)</li><li class="list-disc">The snapshot will take place at 13:00 UTC on Sep 5, 2024</li><li class="list-disc">Failure to maintain this balance during the Snapshot Period will result in ineligibility.</li></ul>
      `,
  })
  snapshot_description?: string;

  @ApiProperty({ required: true, default: dayjs.utc().add(5, 'day').toDate() })
  investment_start_at: Date;

  @ApiProperty({ required: true, default: dayjs.utc().add(6, 'day').toDate() })
  investment_end_at: Date;

  @ApiProperty({
    required: false,
    default:
      "Kyupad uses a smart contract to randomly select tickets, making it fair for all applicants to win token allocations. At this time, you'll be able to check your participation to see if you're a winner. You can only use USDT to invest. Remember to engage on Twitter/X to increase your chances.",
  })
  investment_description?: string;

  @ApiProperty({ required: true, default: dayjs.utc().add(7, 'day').toDate() })
  claim_start_at: Date;

  @ApiProperty({
    required: false,
    default:
      'Participants selected in the token allocation lottery can check their allocation and redeem tokens before the Redemption Deadline.',
  })
  claim_description?: string;
}

class TokenInfo {
  @ApiProperty({ default: 'XXX' })
  symbol: string; // field

  @ApiProperty({ default: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3' })
  address: string; // field

  @ApiProperty({ default: 657000 })
  initial_market_cap: number; // field

  @ApiProperty({
    default: 'Milestone',
    enum: EProjectVestingType,
    enumName: 'vesting_type',
  })
  vesting_type: string; // field

  @ApiProperty({
    default: '15% TGE, 1-Month Cliff, Then Monthly Vesting In 4 Months',
  })
  vesting_schedule: string;

  @ApiProperty({
    default: dayjs.utc().toDate(),
  })
  token_distribute_time: Date; // field

  @ApiProperty({
    default: `
    <h3 class="text-2xl font-bold">Restricted</h3>

    <p>Afghanistan, Angola, Bahamas, Bosnia and Herzegovina, Botswana, Burundi, Cambodia, Cameroon, Canada, Chad, China, Congo (Congo-Brazzaville), Cuba, Democratic, Republic of the Congo, Eritrea, Ethiopia, Ghana, Guinea, Guinea-Bissau, Haiti, Iran, Iraq, Laos, Libya, Madagascar, Mozambique, Nicaragua, North Korea, Pakistan, Serbia, Seychelles, Somalia, South Sudan, Sri Lanka, Sudan, Syria, Tajikistan, Trinidad and Tobago, Tunisia, Turkmenistan, Uganda, United States of America, Uzbekistan, Vanuatu, Venezuela, Yemen, Zimbabwe.</p>

    <h3 class="text-2xl font-bold">Terms & Conditions</h3>

    <p>Afghanistan, Angola, Bahamas, Bosnia and Herzegovina, Botswana, Burundi, Cambodia, Cameroon, Canada, Chad, China, Congo (Congo-Brazzaville), Cuba, Democratic, Republic of the Congo, Eritrea, Ethiopia, Ghana, Guinea, Guinea-Bissau, Haiti, Iran, Iraq, Laos, Libya, Madagascar, Mozambique, Nicaragua, North Korea, Pakistan, Serbia, Seychelles, Somalia, South Sudan, Sri Lanka, Sudan, Syria, Tajikistan, Trinidad and Tobago, Tunisia, Turkmenistan, Uganda, United States of America, Uzbekistan, Vanuatu, Venezuela, Yemen, Zimbabwe.</p>
    `,
    required: false,
  })
  article?: string; // field
}

export class ListProjectResult extends OmitType(Project, [
  '_id',
  'timeline',
  'token_info',
  'assets',
] as const) {
  @ApiProperty()
  timeline: Timeline;
  @ApiProperty()
  token_info: TokenInfo;
}

class ListProjectResultWithPagination {
  @ApiProperty({ isArray: true, type: ListProjectResult })
  projects: ListProjectResult[];
  @ApiProperty()
  pagination: PaginationResponse;
}

class ListProjectQuery {
  type: EProjectType;
  limit?: number;
  page?: number;
}

class ListProjectResponse extends withBaseResponse(
  ListProjectResultWithPagination,
) {}

class ProjectResult extends OmitType(Project, ['_id', 'assets']) {}

class DetailProjectResult {
  @ApiProperty()
  is_applied: boolean;

  @ApiProperty()
  project: ProjectResult;
}

class DetailProjectResponse extends withBaseResponse(DetailProjectResult) {}

class ProjectApplyBody {
  @ApiProperty()
  @IsString()
  project_id: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsEmail()
  notification_email?: string;
}

class ProjectApplyMockBody {
  @ApiProperty()
  project_id: string;

  @ApiProperty()
  user_id?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsEmail()
  notification_email?: string;
}

class ProjectApplyResponse extends withBaseResponse(ProjectApplyBody) {}

export {
  ListProjectResponse,
  ListProjectQuery,
  DetailProjectResponse,
  ProjectApplyBody,
  ProjectApplyResponse,
  ProjectApplyMockBody,
};
