import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RefCodeDocument = HydratedDocument<RefCode>;

@Schema({ timestamps: true })
export class RefCode {
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
  wallet: string;
}

export const RefCodeSchema = SchemaFactory.createForClass(RefCode);
