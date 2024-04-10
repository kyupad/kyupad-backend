import { Module } from '@nestjs/common';
import { UserProjectService } from './user-project.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProject } from '@/schemas/user_project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProject.name, schema: UserProject },
    ]),
  ],
  providers: [UserProjectService],
  exports: [UserProjectService],
})
export class UserProjectServiceModule {}
