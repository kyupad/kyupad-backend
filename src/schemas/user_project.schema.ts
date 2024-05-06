import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { ESnapshotStatus } from '@/enums';
import { CatnipAssetHolder } from '@usecases/project/project.input';
import { NftCollection } from '@schemas/nft_collections.schema';

export type UserDocument = HydratedDocument<UserProject>;

class TokenInfo {
  address: string;

  name: string;

  symbol: string;

  owner: string;

  balance: number;

  price_per_token?: number;

  total_price?: number;

  currency: string;

  multi_pier?: number;

  icon?: string;
}

@Schema({ timestamps: true })
export class UserProject {
  @Prop({ auto: true, type: mongoose.Schema.Types.ObjectId })
  _id?: string;

  @ApiProperty({ default: 'id' })
  @Prop({ type: mongoose.Schema.Types.String })
  user_id: string;

  @Prop({ type: String })
  @ApiProperty({ default: 'id' })
  @Prop({ type: mongoose.Schema.Types.UUID })
  project_id: string;

  @Prop({ default: false })
  is_applied: boolean;

  @Prop({
    type: 'string',
    enum: ESnapshotStatus,
    default: ESnapshotStatus.PROCESSING,
  })
  snapshot_status?: ESnapshotStatus;

  @Prop({ type: 'Date' })
  last_snapshot_time?: Date;

  @Prop({ type: Array, required: false })
  catnip_assets_holder?: CatnipAssetHolder[];

  @Prop({ type: Number, required: false })
  total_ticket?: number;

  @ApiProperty({ type: Number })
  @Prop({
    type: Number,
    default: 1,
  })
  multi_pier?: number;

  @Prop({ type: Number, required: false })
  total_assets?: number;

  @Prop({ type: Array, required: false })
  tokens_with_price?: TokenInfo[];

  @Prop({ type: Array, required: false })
  nfts_with_price?: NftCollection[];
}

export const UserProjectSchema = SchemaFactory.createForClass(UserProject);
