import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type KyupadNftDocument = HydratedDocument<KyupadNft>;

@Schema({ timestamps: true })
export class KyupadNft {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  })
  @ApiProperty()
  _id?: string;

  @ApiProperty({ type: String, required: false })
  @Prop({ required: false, type: String })
  nft_address?: string;

  @ApiProperty({ type: String, required: true })
  @Prop({ required: true, type: String })
  nft_name: string;

  @ApiProperty({ type: String, required: true })
  @Prop({ required: true, type: String })
  season_id: string;

  @ApiProperty({ type: String, required: true })
  @Prop({ required: true, type: String })
  pool_id: string;

  @ApiProperty({ type: String, required: false })
  @Prop({ required: false, type: String })
  collection_address?: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: false })
  request_wallet?: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: false })
  owner_address?: string;

  @Prop({ type: String, required: false })
  signature?: string;

  @Prop({ type: String, required: false })
  error_info?: string;

  @Prop({ type: String, required: false })
  ref_code?: string;
}

export const KyupadNftSchema = SchemaFactory.createForClass(KyupadNft);
