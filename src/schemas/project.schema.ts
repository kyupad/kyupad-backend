import { ProjectSalePool, ProjectVestingType } from '@/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import dayjs from 'dayjs';
import mongoose, { HydratedDocument } from 'mongoose';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export type ProjectDocument = HydratedDocument<Project>;

class Socials {
  @ApiProperty({ required: false })
  @Prop({ required: false, type: mongoose.Schema.Types.String })
  x?: string;

  @ApiProperty({ required: false })
  @Prop({ required: false, type: mongoose.Schema.Types.String })
  discord?: string;

  @ApiProperty({ required: false })
  @Prop({ required: false, type: mongoose.Schema.Types.String })
  telegram?: string;

  @ApiProperty({ required: false })
  @Prop({ required: false, type: mongoose.Schema.Types.String })
  website?: string;
}

class Info {
  @ApiProperty({ default: 300000 })
  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  total_raise: number; // field

  @ApiProperty({ default: 300 })
  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  ticket_size: number; // field

  @ApiProperty({
    default: 'Subscription',
    enum: ProjectSalePool,
    enumName: 'sale_pool',
  })
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    enum: ProjectSalePool,
  })
  sale_pool: string; // field

  @ApiProperty({ default: 100000000 })
  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  token_offered: number; // field
}

class TokenInfo {
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  symbol: string; // field

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  address: string; // field

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  initial_market_cap: number; // field

  @Prop({
    type: mongoose.Schema.Types.String,
    enum: ProjectVestingType,
  })
  vesting_type: string; // field

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  vesting_schedule: string;

  @Prop({ required: true, type: mongoose.Schema.Types.Date })
  token_distribute_time: Date; // field

  @Prop({ required: false, type: mongoose.Schema.Types.String })
  article?: string; // field
}

class Timeline {
  @Prop({ required: true, type: mongoose.Schema.Types.Date })
  registration_start_at: Date; // field

  @Prop({ required: true, type: mongoose.Schema.Types.Date })
  registration_end_at: Date; // field

  @Prop({ required: false, type: mongoose.Schema.Types.String })
  registration_description?: string; // field

  @Prop({ required: true, type: mongoose.Schema.Types.Date })
  snapshot_start_at: Date; // field

  @Prop({ required: true, type: mongoose.Schema.Types.Date })
  snapshot_end_at: Date; // field

  @Prop({ required: true, type: mongoose.Schema.Types.Date })
  investment_start_at: Date; // field

  @Prop({ required: true, type: mongoose.Schema.Types.Date })
  investment_end_at: Date; // field

  @Prop({ required: true, type: mongoose.Schema.Types.Date })
  claim_start_at: Date; // field
}

class Price {
  @ApiProperty({ default: 0.1 })
  @Prop({ type: mongoose.Schema.Types.Number })
  amount: number; // field

  @ApiProperty({ default: 'USDT' })
  @Prop({ type: mongoose.Schema.Types.String })
  currency: string; // field
}

class Assets {
  @ApiProperty({ default: ['HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3'] })
  @Prop({
    type: mongoose.Schema.Types.Array,
  })
  token: string[]; // field

  @ApiProperty({
    default: [
      '8588cfc580248be304c2852c9505d69dd873a1ea57ff65d96cd2807dd3da288c',
    ],
  })
  @Prop({
    type: mongoose.Schema.Types.Array,
  })
  nft: string[]; // field
}

@Schema({ timestamps: true })
export class Project {
  @ApiProperty({ required: false })
  @Prop({ auto: true, type: mongoose.Schema.Types.ObjectId, required: false })
  _id?: string; // field

  @ApiProperty({ default: 'Project A' })
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  name: string; // field

  @ApiProperty({ default: 'project-a' })
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  slug: string; // field

  @ApiProperty({
    default: 'https://dev-bucket.kyupad.xyz/public/kyu.jpeg',
  })
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  logo: string; // field

  @ApiProperty({
    default: 'https://dev-bucket.kyupad.xyz/public/meow.jpeg',
  })
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  thumbnail: string; // field

  @ApiProperty({ required: false, default: ['Perp DEX', 'Defi'] })
  @Prop({ type: [mongoose.Schema.Types.String] })
  tags?: string[]; // field

  @ApiProperty({
    default: 'Short description of project!',
  })
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  short_description: string; // field

  @ApiProperty({ required: false, default: '' })
  @Prop({ required: false, type: mongoose.Schema.Types.String })
  description?: string; // field

  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.Map })
  info: Info; // field

  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.Map })
  token_info: TokenInfo; // field

  @ApiProperty({
    required: false,
    default: {
      x: 'https://twitter.com/noah_duongz',
    },
  })
  @Prop({
    required: false,
    type: mongoose.Schema.Types.Map,
  })
  socials?: Socials; // field

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.Map,
  })
  timeline: Timeline; // field

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.Map,
  })
  price: Price;

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.Map,
  })
  assets: Assets;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
