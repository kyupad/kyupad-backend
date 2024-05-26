import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ETxVerifyStatus } from '@/enums';

export type InvestingHistoryDocument = HydratedDocument<InvestingHistory>;

@Schema({ timestamps: true })
export class InvestingHistory {
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

  @Prop({ required: false, type: String })
  pda_account?: string;

  @Prop({ required: true, type: String })
  project_id: string;

  @Prop({ required: true, type: String })
  wallet: string;

  @Prop({ required: true, type: Number })
  total: number;

  @Prop({ required: true, type: Number })
  on_chain_total: number;

  @Prop({ required: false, type: String })
  signature: string;

  @Prop({ default: ETxVerifyStatus.NOT_VERIFY, type: String })
  verify_status: ETxVerifyStatus;

  @Prop({ required: true, type: 'Date' })
  verify_at?: Date;
}

export const InvestingHistorySchema =
  SchemaFactory.createForClass(InvestingHistory);
