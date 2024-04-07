import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type FungibleTokenDocument = HydratedDocument<FungibleToken>;

@Schema({ timestamps: true })
export class FungibleToken {
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
  symbol: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ required: true, type: String })
  name: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ required: true, type: String })
  icon: string;

  @ApiProperty({
    type: Date,
    required: false,
  })
  @Prop({ type: String })
  created_by: string;
}

export const FungibleTokenSchema = SchemaFactory.createForClass(FungibleToken);
