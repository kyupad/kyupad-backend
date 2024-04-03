import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @ApiProperty()
  @Prop({ auto: true, type: mongoose.Schema.Types.ObjectId })
  _id?: string;
  @ApiProperty({ default: 'Project A' })
  @Prop()
  name: string;
  @ApiProperty({ default: 'project-a' })
  @Prop()
  slug: string;
  @ApiProperty({ default: 'XXX' })
  @Prop()
  symbol: string;
  @ApiProperty({
    default: 'https://dev-bucket.kyupad.xyz/public/kyu.jpeg',
  })
  @Prop()
  logo: string;
  @ApiProperty({
    default: 'https://dev-bucket.kyupad.xyz/public/meow.jpeg',
  })
  @Prop()
  thumbnail: string;
  @ApiProperty({ required: false, default: ['Perp DEX', 'Defi'] })
  @Prop()
  tags?: string[];
  @ApiProperty({
    default: 'Short description of project!',
  })
  @Prop()
  short_description: string;
  @ApiProperty({ required: false, default: '' })
  @Prop()
  description?: string;
  @ApiProperty({ default: 300000 })
  @Prop()
  total_raise: number;
  @ApiProperty({ default: 300 })
  @Prop()
  ticket_size: number;
  @ApiProperty({ default: 'Lottery' })
  @Prop()
  sale_pool: string;
  @ApiProperty({
    default: new Date(
      new Date().setDate(new Date().getDate() + 1),
    ).toISOString(),
  })
  @Prop()
  registration_at: Date;
  @ApiProperty({
    default: new Date(
      new Date().setDate(new Date().getDate() + 2),
    ).toISOString(),
  })
  @Prop()
  snapshot_at: Date;
  @ApiProperty({
    default: new Date(
      new Date().setDate(new Date().getDate() + 3),
    ).toISOString(),
  })
  @Prop()
  investment_at: Date;
  @ApiProperty({
    default: new Date(
      new Date().setDate(new Date().getDate() + 4),
    ).toISOString(),
  })
  @Prop()
  claim_at: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
