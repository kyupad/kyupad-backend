import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CollectionsModule } from '@usecases/admin/nft';
import { SeasonModule } from '@usecases/admin/season/season.module';

@Module({
  imports: [
    CollectionsModule,
    SeasonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AdminModule {}
