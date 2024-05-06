import { Module } from '@nestjs/common';
import { UserProjectService } from './user-project.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProject } from '@/schemas/user_project.schema';
import { ProjectServiceModule } from '@/services/project/project.module';
import { AwsSQSServiceModule } from '@/services/aws/sqs/sqs.module';
import { SeasonServiceModule } from '@/services/season/season.module';
import { NftServiceModule } from '@/services/nft/nft.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProject.name, schema: UserProject },
    ]),
    ProjectServiceModule,
    AwsSQSServiceModule,
    SeasonServiceModule,
    NftServiceModule,
  ],
  providers: [UserProjectService],
  exports: [UserProjectService],
})
export class UserProjectServiceModule {}
