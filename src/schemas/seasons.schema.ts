import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ESnapshotStatus } from '@/enums';
import { ApiProperty } from '@nestjs/swagger';
import { NftCollection } from '@schemas/nft_collections.schema';
import { Expose } from 'class-transformer';

export type SeasonDocument = HydratedDocument<Season>;

@Schema({ timestamps: true })
export class Season {
  @Expose({ groups: ['response'] })
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  })
  @ApiProperty()
  _id?: string;

  @Expose({ groups: ['response'] })
  @ApiProperty()
  @Prop({ required: true, type: String })
  season_code: string;

  @Expose({ groups: ['response'] })
  @ApiProperty()
  @Prop({ required: true, type: String })
  season_name: string;

  @ApiProperty({
    isArray: true,
    type: String,
  })
  @Prop({ type: 'array', required: true })
  collections: string[];

  @Expose({ groups: ['response'] })
  @ApiProperty({ type: Date })
  @Prop({ required: true, type: 'Date' })
  start_at: Date;

  @Expose({ groups: ['response'] })
  @ApiProperty({ type: Date })
  @Prop({ required: true, type: 'Date' })
  end_at: Date;

  @ApiProperty({ type: Date })
  @Prop({ required: true, type: 'Date' })
  snapshot_at: Date;

  @ApiProperty()
  @Prop({ type: String })
  snapshot_file?: string;

  @ApiProperty({ enum: ESnapshotStatus })
  @Prop({
    type: 'string',
    enum: ESnapshotStatus,
    default: ESnapshotStatus.UPCOMING,
  })
  snapshot_status?: ESnapshotStatus;

  @Prop({
    type: Object,
  })
  nft_collection?: NftCollection;

  @Prop({
    type: Boolean,
    default: false,
  })
  is_active?: boolean;

  @ApiProperty()
  @Prop({ type: 'Date' })
  snapshot_start_at?: Date;

  @ApiProperty()
  @Prop({ type: 'Date' })
  snapshot_end_at?: Date;

  @Prop({ type: 'number', default: 0 })
  retry_count?: number;

  @Prop({ type: 'string' })
  error_reason?: string;

  @Prop({ required: true, type: String })
  created_by: string;
}

export const SeasonSchema = SchemaFactory.createForClass(Season);
