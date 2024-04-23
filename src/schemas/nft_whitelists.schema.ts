import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { NftCollection } from '@schemas/nft_collections.schema';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export type NftWhiteListDocument = HydratedDocument<NftWhiteList>;

@Schema({ timestamps: true })
export class NftWhiteList {
  @Expose({ groups: ['road-map'] })
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  })
  @ApiProperty({
    type: String,
    required: true,
  })
  _id?: string;

  @Expose({ groups: ['road-map'] })
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
  })
  @ApiProperty({
    type: String,
    required: true,
  })
  season_id: string;

  @Prop({ required: false, type: String })
  @ApiProperty({
    type: String,
    required: false,
  })
  collection_address?: string;

  @Expose({ groups: ['road-map'] })
  @Prop({ required: false, type: String })
  community_name?: string;

  @Prop({ required: true, type: [String] })
  @ApiProperty({
    isArray: true,
    type: String,
    required: true,
  })
  holders?: string[];

  @Prop({ required: true, type: Number })
  @ApiProperty({
    type: Number,
    required: true,
  })
  nfts_total: number;

  @Prop({ required: true, type: Number })
  @ApiProperty({
    type: Number,
    required: true,
  })
  holders_total: number;

  @Prop({ required: false, type: Number })
  order?: number;

  @Prop({ required: true, type: String })
  @ApiProperty({
    type: String,
    required: false,
  })
  created_by: string;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @Prop({ default: false, type: Boolean })
  is_other_community?: boolean;

  collection?: NftCollection[];

  @ApiProperty({
    type: String,
    required: false,
  })
  @Prop({ required: false, type: String })
  merkle_root?: string;

  @Expose({ groups: ['road-map'] })
  @ApiProperty({ type: Date })
  @Prop({ required: false, type: 'Date' })
  start_time?: Date;

  @Expose({ groups: ['road-map'] })
  @ApiProperty({ type: Date })
  @Prop({ required: false, type: 'Date' })
  end_time?: Date;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @Prop({ required: false, type: Number })
  mint_fee: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @Prop({ required: false, type: Number })
  minted_total: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @Prop({ required: false, type: Number })
  pool_supply: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @Prop({ required: false, type: Number })
  total_mint_per_wallet: number;

  @Expose({ groups: ['road-map'] })
  @ApiProperty({
    type: Boolean,
    default: false,
  })
  @Prop({ default: false, type: Boolean })
  is_active_pool?: boolean;

  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ require: true, type: String })
  @IsNotEmpty()
  destination_wallet?: string;
}

export const NftWhiteListSchema = SchemaFactory.createForClass(NftWhiteList);
