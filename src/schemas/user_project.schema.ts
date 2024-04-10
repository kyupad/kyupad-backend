import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { ESnapshotStatus } from '@/enums';
import { CatnipAssetHolder } from '@usecases/project/project.input';

export type UserDocument = HydratedDocument<UserProject>;

@Schema()
export class UserProject {
  @Prop({ auto: true, type: mongoose.Schema.Types.ObjectId })
  _id?: string;
  @Prop()
  @ApiProperty({ default: 'id' })
  user_id: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  @ApiProperty({ default: 'id' })
  project_id: string;
  @Prop({ default: false })
  @ApiProperty({ default: false })
  is_applied: boolean;

  @Prop({
    type: 'string',
    enum: ESnapshotStatus,
    default: ESnapshotStatus.PROCESSING,
  })
  snapshot_status?: ESnapshotStatus;

  @Prop({ type: 'Date' })
  last_snapshot_time?: Date;

  @Prop({ type: Array, required: false })
  catnip_assets_holder?: CatnipAssetHolder[];
}

export const UserProjectSchema = SchemaFactory.createForClass(UserProject);
