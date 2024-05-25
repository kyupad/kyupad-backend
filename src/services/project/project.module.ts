import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '@/schemas/project.schema';
import { UserProject, UserProjectSchema } from '@/schemas/user_project.schema';
import { FungibleTokensModule } from '../fungible-tokens/fungible-tokens.module';
import {
  InvestingHistory,
  InvestingHistorySchema,
} from '@schemas/investing_histories.schema';
import { NftServiceModule } from '@/services/nft/nft.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: UserProject.name, schema: UserProjectSchema },
      { name: InvestingHistory.name, schema: InvestingHistorySchema },
      { name: UserProject.name, schema: UserProjectSchema },
    ]),
    FungibleTokensModule,
    NftServiceModule,
  ],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectServiceModule {}
