import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Season } from '@schemas/seasons.schema';
import { CreateSeasonInput } from '@usecases/admin/season/season.input';
import { ESnapshotStatus } from '@/enums';
import { AwsSchedulerService } from '@/services/aws/scheduler/scheduler.service';
import { NftService } from '@/services/nft/nft.service';
import {
  INftSnapshotSchedulerInput,
  INftSnapshotUpcomingNotificationSchedulerInput,
} from '@/services/season/session.input';
import { NftCollection } from '@schemas/nft_collections.schema';

@Injectable()
export class SeasonService {
  constructor(
    @InjectModel(Season.name)
    private readonly seasonModel: Model<Season>,
    @Inject(AwsSchedulerService)
    private readonly awsSchedulerService: AwsSchedulerService,
    @Inject(NftService)
    private readonly nftService: NftService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async seasonDetail(id: string): Promise<Season> {
    const season = await this.seasonModel.findById<Season>(id);
    if (!season) throw new BadRequestException('Season not found');
    return season;
  }

  async createSeason(input: CreateSeasonInput): Promise<Season> {
    const collectionInfo = await this.nftService.getCollectionByAddress(
      input.collections,
    );
    if (collectionInfo.length !== input.collections.length)
      throw new BadRequestException('Collections invalid');
    const session = await this.connection.startSession();
    const resultTrans = await session.withTransaction(async () => {
      const season: Season = {
        season_code: input.season_code,
        season_name: input.season_name,
        collections: input.collections,
        snapshot_at: new Date(input.snapshot_at),
        snapshot_status: ESnapshotStatus.UPCOMING,
        created_by: 'ADMIN', //FIXME: Sau khi làm chức năng Auth thì update
      };
      const results = await this.seasonModel.create([season], { session });
      const result = results[0];
      const seasonId = result.id as string;
      const snapShotAt = new Date(input.snapshot_at);
      await this.createSnapshotSchedule(
        seasonId,
        snapShotAt,
        season,
        collectionInfo,
      );
      return result;
    });
    await session.endSession();
    return resultTrans;
  }

  async createSnapshotSchedule(
    seasonId: string,
    snapShotAt: Date,
    season: Season,
    collectionInfo: NftCollection[],
  ): Promise<void> {
    snapShotAt.setMinutes(snapShotAt.getMinutes() - 5);
    await Promise.all([
      this.awsSchedulerService.createOneTimeSchedule<INftSnapshotUpcomingNotificationSchedulerInput>(
        {
          name: `kyupad-${process.env.STAGE}-upcoming-${seasonId.substring(0, 4)}-${seasonId.substring(seasonId.length - 6, seasonId.length)}`,
          group_name: process.env.AWS_SNAPSHOT_GROUP_NAME as string,
          schedule_time: snapShotAt.toISOString().split('.')[0],
          target: {
            type: 'LAMBDA',
            arn: process.env.LAMBDA_SNAPHOT_NOTIFICATION_ARN as string,
            role_arn: process.env.AWS_SNAPSHOT_SCHEDULER_ROLE_ARN as string,
            input: {
              season: season.season_name,
              season_id: seasonId,
              snapshot_at: season.snapshot_at.toISOString(),
              type: 'upcoming_nft_snapshot',
              collectionName: collectionInfo.map((col) => col.name),
            },
          },
        },
      ),
      this.awsSchedulerService.createOneTimeSchedule<INftSnapshotSchedulerInput>(
        {
          name: `kyupad-${process.env.STAGE}-nft-snapshot-${seasonId.substring(0, 4)}-${seasonId.substring(seasonId.length - 6, seasonId.length)}`,
          group_name: process.env.AWS_SNAPSHOT_GROUP_NAME as string,
          schedule_time: (() => {
            const snapshotSqs = season.snapshot_at;
            snapshotSqs.setSeconds(snapshotSqs.getSeconds() - 30);
            return snapshotSqs.toISOString().split('.')[0];
          })(),
          target: {
            type: 'SQS',
            sqs_msg_group_id: seasonId,
            arn: process.env.SQS_NFT_SNAPHOT_ARN as string,
            role_arn: process.env.AWS_SNAPSHOT_SCHEDULER_ROLE_ARN as string,
            input: {
              season_name: season.season_name,
              season_id: seasonId,
              collections: collectionInfo,
            },
          },
        },
      ),
    ]);
  }
}
