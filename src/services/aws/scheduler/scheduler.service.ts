import { Injectable, Logger } from '@nestjs/common';
import {
  SchedulerClient,
  CreateScheduleCommand,
} from '@aws-sdk/client-scheduler';
import { ICreateScheduleOption } from '@/services/aws/scheduler/scheduler.interface';
import { CreateScheduleCommandInput } from '@aws-sdk/client-scheduler/dist-types/commands/CreateScheduleCommand';

@Injectable()
export class AwsSchedulerService {
  private logger = new Logger(AwsSchedulerService.name);
  private client: SchedulerClient;

  constructor() {
    this.client = new SchedulerClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_KEY as string,
      },
    });
  }

  async createOneTimeSchedule<I>(
    option: ICreateScheduleOption<I>,
  ): Promise<void> {
    this.logger.log(
      `[PROCESSING] [SCHEDULER] Create [${option?.target?.type}] [${option?.name}] with params [${JSON.stringify(
        option?.target?.input,
      )}] `,
    );
    try {
      const input: CreateScheduleCommandInput = {
        Name: option.name,
        ActionAfterCompletion: 'DELETE',
        FlexibleTimeWindow: {
          Mode: 'OFF',
        },
        ScheduleExpression: `at(${option.schedule_time})`,
        ScheduleExpressionTimezone: 'UTC',
        GroupName: option.group_name,
        Target: {
          Arn: option.target.arn,
          Input: JSON.stringify(option.target.input),
          RetryPolicy: {
            MaximumEventAgeInSeconds: 60,
            MaximumRetryAttempts: 5,
          },
          RoleArn: option.target.role_arn,
          SqsParameters:
            option.target.type === 'SQS'
              ? { MessageGroupId: option.target?.sqs_msg_group_id }
              : undefined,
        },
      };
      const cmd = new CreateScheduleCommand(input);
      await this.client.send(cmd);
      this.logger.log(
        `[SUCCESSFUL] [SCHEDULER] Create [${option?.target?.type}] [${option?.name}] with params [${JSON.stringify(
          option?.target?.input,
        )}] `,
      );
    } catch (e) {
      this.logger.error(
        `[ERROR] [SCHEDULER] Create [${option?.target?.type}] [${option?.name}] with params [${JSON.stringify(
          option?.target?.input,
        )}], ${e.stack}`,
      );
    }
  }
}
