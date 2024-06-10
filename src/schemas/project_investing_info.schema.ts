import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProjectRaffleDocument = HydratedDocument<ProjectInvestingInfo>;

@Schema()
export class ProjectInvestingInfo {
  @Prop({ auto: true, type: mongoose.Schema.Types.ObjectId })
  _id?: string;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  project_id: string;

  @Prop({ type: [String] })
  whitelist: string[];

  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  merkle_root: string;

  @ApiProperty({ type: String, required: false })
  @Prop({ type: String, required: false })
  destination_wallet?: string;
}

export const ProjectInvestingInfoSchema =
  SchemaFactory.createForClass(ProjectInvestingInfo);
