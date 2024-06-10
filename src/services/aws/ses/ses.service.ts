import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SendEmailRequest,
  SendEmailCommand,
  SESClient,
} from '@aws-sdk/client-ses';
import { ISesOption } from '@/services/aws/ses/ses.infterface';

@Injectable()
export class SeSService {
  private logger = new Logger(SeSService.name);
  private client: SESClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new SESClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY')!,
        secretAccessKey: this.configService.get('AWS_SECRET_KEY')!,
      },
    });
  }

  async send(option: ISesOption, isThrowError = false): Promise<void> {
    this.logger.log(
      `[PROCESSING...] [SES service] send email [${option.type}] to [${option.to}]`,
    );
    try {
      const sendEmailRequest: SendEmailRequest = {
        Source: option.from || this.configService.get('AWS_SES_SENDER'),
        Destination: {
          ToAddresses: option.to,
        },
        Message: {
          Subject: {
            Data: option.subject.data,
            Charset: option.subject.charset,
          },
          Body: {},
        },
      };
      if (option.body.html && sendEmailRequest.Message?.Body)
        sendEmailRequest.Message.Body.Html = {
          Data: option.body.html.data,
          Charset: option.body.html.charset,
        };
      else if (sendEmailRequest.Message?.Body)
        sendEmailRequest.Message.Body.Text = {
          Data: option.body.text?.data || 'No content',
          Charset: option.body.text?.charset,
        };
      const sendEmailCommand = new SendEmailCommand(sendEmailRequest);
      await this.client.send(sendEmailCommand);
      this.logger.log(
        `[SUCCESS] [SES service] send email [${option.type}] to [${option.to}]`,
      );
    } catch (e) {
      this.logger.error(
        `[ERROR] [SES service] send email [${option.type}] to [${option.to}] has error ${e.stack}`,
      );
      if (isThrowError) throw e;
    }
  }

  fillTemplate(content: string, variables: Record<string, string>) {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.split(`{{${key}}}`).join(value);
    });

    return result;
  }
}
