import { Module } from '@nestjs/common';
import { UserProjectService } from './user-project.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProject } from '@/schemas/user_project.schema';
import { ProjectServiceModule } from '@/services/project/project.module';
import { AwsSQSServiceModule } from '@/services/aws/sqs/sqs.module';
import { SeasonServiceModule } from '@/services/season/season.module';
import { NftServiceModule } from '@/services/nft/nft.module';
import { ProjectInvestingInfoModule } from '../project-investing-info/project-investing-info.module';
import { FungibleTokensModule } from '../fungible-tokens/fungible-tokens.module';
import {
  InvestingHistory,
  InvestingHistorySchema,
} from '@schemas/investing_histories.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProject.name, schema: UserProject },
      { name: InvestingHistory.name, schema: InvestingHistorySchema },
    ]),
    ProjectServiceModule,
    AwsSQSServiceModule,
    SeasonServiceModule,
    NftServiceModule,
    ProjectInvestingInfoModule,
    FungibleTokensModule,
  ],
  providers: [UserProjectService],
  exports: [UserProjectService],
})
export class UserProjectServiceModule {}
