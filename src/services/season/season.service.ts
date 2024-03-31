import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Season } from '@schemas/seasons.schema';
import { CreateSeasonInput } from '@usecases/admin/season/season.input';
import { ESnapshotStatus } from '@/enums';

@Injectable()
export class SeasonService {
  constructor(
    @InjectModel(Season.name)
    private readonly seasonModel: Model<Season>,
  ) {}

  async seasonDetail(id: string): Promise<Season> {
    const season = await this.seasonModel.findById<Season>(id);
    if (!season) throw new BadRequestException('Season not found');
    return season;
  }

  async createSeason(input: CreateSeasonInput): Promise<Season> {
    const season: Season = {
      season_code: input.season_code,
      season_name: input.season_name,
      collections: input.collections,
      snapshot_at: new Date(input.snapshot_at),
      snapshot_status: ESnapshotStatus.UPCOMING,
    };
    const result = await this.seasonModel.create(season);
    return result;
  }
}
