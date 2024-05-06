import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { EProjectUserAssetType, ESnapshotStatus } from '@/enums';
import { CatnipAssetHolder } from '@usecases/project/project.input';

export type UserDocument = HydratedDocument<UserProject>;

class AssetWithPrice {
  name: string;

  symbol: string;

  icon: string;

  total_assets: number;

  price_per_token: string;

  total_price: number;

  asset_type: EProjectUserAssetType;

  multi_pier: number;
}

class NftAssetWithPrice {
  collection_address: string;

  total_assets: number;

  price_per_asset: string;

  total_price: number;

  asset_type: EProjectUserAssetType;

  multi_pier: number;
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
  tokens_with_price?: AssetWithPrice[];

  @Prop({ type: Array, required: false })
  nfts_with_price?: NftAssetWithPrice[];
}

export const UserProjectSchema = SchemaFactory.createForClass(UserProject);
