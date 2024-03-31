import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type NftCollectionDocument = HydratedDocument<NftCollection>;

@Schema({ timestamps: true })
export class NftCollection {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  })
  _id?: string;

  @Prop({ required: true, type: String })
  address: string;

  @Prop({ required: true, type: String })
  name: string;
}

export const NftCollectionSchema = SchemaFactory.createForClass(NftCollection);
