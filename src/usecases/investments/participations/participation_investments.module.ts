import { Module } from '@nestjs/common';
import { UserParticipationController } from '@usecases/investments/participations/participation_registration.controller';

@Module({
  imports: [],
  controllers: [UserParticipationController],
})
export class UserParticipationModule {}
