import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type NftWhiteListDocument = HydratedDocument<NftWhiteList>;

@Schema({ timestamps: true })
export class NftWhiteList {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  })
  _id?: string;

  @Prop({ required: true, type: String })
  collection_address: string;

  @Prop({ required: true, type: [String] })
  holders: string[];

  @Prop({ required: true, type: String })
  created_by: string;
}

export const NftWhiteListSchema = SchemaFactory.createForClass(NftWhiteList);
