import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type NftWhiteListDocument = HydratedDocument<NftWhiteList>;

@Schema({ timestamps: true })
export class NftWhiteList {
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

  @Prop({ required: true, type: String })
  @ApiProperty({
    type: String,
    required: true,
  })
  collection_address: string;

  @Prop({ required: true, type: [String] })
  @ApiProperty({
    isArray: true,
    type: String,
    required: true,
  })
  holders: string[];

  @Prop({ required: true, type: String })
  @ApiProperty({
    type: String,
    required: false,
  })
  created_by: string;
}

export const NftWhiteListSchema = SchemaFactory.createForClass(NftWhiteList);
