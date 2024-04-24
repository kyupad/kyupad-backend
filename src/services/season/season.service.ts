import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Season } from '@schemas/seasons.schema';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SeasonService {
  constructor(
    @InjectModel(Season.name) private readonly seasonModel: Model<Season>,
  ) {}

  async activeSeason(excludeExtraneousValues = true): Promise<Season> {
    const season = await this.seasonModel.findOne({
      is_active: true,
    });
    if (!season) throw new NotFoundException('Season not exist');
    return plainToInstance(Season, JSON.parse(JSON.stringify(season)), {
      excludeExtraneousValues: excludeExtraneousValues,
      groups: ['response'],
    });
  }

  async getSeasonById(id: string): Promise<Season> {
    const season = await this.seasonModel.findById({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!season) throw new NotFoundException('Season not exist');
    return season;
  }
}
