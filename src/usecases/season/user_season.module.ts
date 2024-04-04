import { Module } from '@nestjs/common';
import { UserSeasonController } from '@usecases/season/user_season.controller';

@Module({
  imports: [],
  controllers: [UserSeasonController],
})
export class UserSeasonModule {}
