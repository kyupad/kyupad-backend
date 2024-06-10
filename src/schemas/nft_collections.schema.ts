import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export type NftCollectionDocument = HydratedDocument<NftCollection>;

@Schema({ timestamps: true })
export class NftCollection {
  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  })
  _id?: string;

  @Expose({ groups: ['response'] })
  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ required: true, type: String })
  address: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ required: true, type: String })
  @Transform(({ value }) => {
    if (value)
      return value.replace('s3://', `${process.env.AWS_S3_BUCKET_URL}/`);
  })
  icon: string;

  @Expose({ groups: ['response'] })
  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ required: true, type: String })
  symbol: string;

  @Prop({ required: true, type: String })
  magic_eden_symbol?: string;

  @Expose({ groups: ['response'] })
  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ required: true, type: String })
  name: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @Prop({ required: false, type: String })
  uri?: string;

  @Prop({ required: true, type: String })
  created_by?: string;

  multi_pier?: number;

  price_per_token?: number;
}

export const NftCollectionSchema = SchemaFactory.createForClass(NftCollection);
