import { Injectable, Logger } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { ICreateQueueOption } from '@/services/aws/sqs/sqs.interface';

@Injectable()
export class AwsSQSService {
  private logger = new Logger(AwsSQSService.name);
  private client: SQSClient;

  constructor() {
    this.client = new SQSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_KEY as string,
      },
    });
  }

  async createSQS<I>(option: ICreateQueueOption<I>): Promise<void> {
    this.logger.log(
      `[PROCESSING] [QUEUE] Send message [${option?.message_group_id}] [${option?.message_deduplication_id}] with params [${JSON.stringify(
        option?.message_body,
      )}] `,
    );
    try {
      const input: SendMessageCommandInput = {
        MessageGroupId: option.message_group_id,
        MessageBody: JSON.stringify(option.message_body),
        MessageDeduplicationId: option.message_deduplication_id,
        QueueUrl: option.queue_url,
      };
      const cmd = new SendMessageCommand(input);
      await this.client.send(cmd);
      this.logger.log(
        `[SUCCESSFUL] [QUEUE] Send message [${option?.message_group_id}] [${option?.message_deduplication_id}]`,
      );
    } catch (e) {
      this.logger.error(
        `[ERROR] [QUEUE] Send message [${option?.message_group_id}] [${option?.message_deduplication_id}], ${e.stack}`,
      );
      throw e;
    }
  }
}
