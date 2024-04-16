import { UserProject } from '@/schemas/user_project.schema';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AwsSQSService } from '@/services/aws/sqs/sqs.service';
import { ProjectService } from '@/services/project/project.service';
import { ICatnipAssetsSnapshotBody } from '@/services/project/project.input';

@Injectable()
export class UserProjectService {
  constructor(
    @InjectModel(UserProject.name)
    private readonly userProjectModel: Model<UserProject>,
    @Inject(ProjectService)
    private readonly projectService: ProjectService,
    @Inject(AwsSQSService)
    private readonly awsSQSService: AwsSQSService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(input: UserProject): Promise<UserProject> {
    const [project, userProject] = await Promise.all([
      this.projectService.findProjectById(input.project_id),
      this.userProjectModel.findOne({
        user_id: input.user_id,
        project_id: input.project_id,
      }),
    ]);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (userProject) throw new NotFoundException('You have joined the project');
    const session = await this.connection.startSession();
    const resultTrans = await session.withTransaction(async () => {
      const result = await this.userProjectModel.create([input], { session });
      await this.awsSQSService.createSQS<ICatnipAssetsSnapshotBody>({
        queue_url: process.env.AWS_QUEUE_URL as string,
        message_group_id: 'REGISTRATION_CATNIP_ASSET_SNAPSHOT',
        message_deduplication_id: result[0].id,
        message_body: {
          user_registration_id: result[0]._id,
          project_id: project._id || '',
          user_id: input.user_id,
        },
      });
      return result[0];
    });
    await session.endSession();
    return resultTrans;
  }

  async findOne(
    userId: string,
    projectId: string,
  ): Promise<UserProject | null> {
    const result = this.userProjectModel.findOne({
      user_id: userId,
      project_id: projectId,
    });
    return result;
  }

  async isApplied(userId: string, projectId: string): Promise<boolean> {
    const result = await this.userProjectModel.findOne({
      user_id: userId,
      project_id: projectId,
    });
    return !!result;
  }
}
