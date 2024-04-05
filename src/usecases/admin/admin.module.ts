import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CollectionsModule } from '@usecases/admin/nft';
import { SeasonModule } from '@usecases/admin/season/season.module';
import { AdminProjectModule } from './project/project.module';

@Module({
  imports: [
    CollectionsModule,
    SeasonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AdminProjectModule,
  ],
  controllers: [],
  providers: [],
})
export class AdminModule {}
