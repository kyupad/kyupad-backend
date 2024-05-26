import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { VestingScheduleInput } from '@usecases/project/project.input';

export type ProjectVestingDocument = HydratedDocument<ProjectVesting>;

@Schema({ timestamps: true })
export class ProjectVesting {
  @ApiProperty({ type: String, required: true })
  @Prop({ auto: true, type: mongoose.Schema.Types.ObjectId })
  _id?: string;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  project_id: string;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  token: string;

  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  token_total: number;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  owner: string;

  @ApiProperty({ type: VestingScheduleInput, required: true, isArray: true })
  @Prop({ type: Array, required: true })
  schedules: VestingScheduleInput[];

  @ApiProperty({ type: Boolean, required: false })
  @Prop({ type: Boolean, default: true })
  cancelable_by_sender?: boolean;

  @ApiProperty({ type: Boolean, required: false })
  @Prop({ type: Boolean, default: false })
  cancelable_by_recipient?: boolean;

  @ApiProperty({ type: Boolean, required: false })
  @Prop({ type: Boolean, default: false })
  transferable_by_sender?: boolean;

  @ApiProperty({ type: Boolean, required: false })
  @Prop({ type: Boolean, default: true })
  transferable_by_recipient?: boolean;

  @ApiProperty({ type: Boolean, required: false })
  @Prop({ type: Boolean, default: false })
  automatic_withdrawal?: boolean;

  @ApiProperty({ type: Boolean, required: false })
  @Prop({ type: String, required: false })
  created_by: string;
}

export const ProjectVestingSchema =
  SchemaFactory.createForClass(ProjectVesting);
