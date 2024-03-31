import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Season, SeasonSchema } from '@schemas/seasons.schema';
import { SeasonService } from '@/services/season/season.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Season.name, schema: SeasonSchema }]),
  ],
  controllers: [],
  providers: [SeasonService],
  exports: [SeasonService],
})
export class SeasonServiceModule {}
