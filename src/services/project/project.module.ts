import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '@/schemas/project.schema';
import { UserProject, UserProjectSchema } from '@/schemas/user_project.schema';
import { AwsSQSServiceModule } from '@/services/aws/sqs/sqs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: UserProject.name, schema: UserProjectSchema },
    ]),
    AwsSQSServiceModule,
  ],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectServiceModule {}
