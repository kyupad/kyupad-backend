import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, auto: true })
  _id?: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  id: string;

  @Prop({ type: mongoose.Schema.Types.String, required: false })
  email?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
