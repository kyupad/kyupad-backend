import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommandInput } from '@aws-sdk/client-s3/dist-types/commands/PutObjectCommand';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly AWS_S3_BUCKET_NAME: string;

  constructor(private readonly configService: ConfigService) {
    this.AWS_S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME')!;
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY')!,
        secretAccessKey: this.configService.get('AWS_SECRET_KEY')!,
      },
    });
  }

  async uploadCnftMetadata({
    data,
    id,
  }: {
    data: string;
    id: string;
  }): Promise<string> {
    const input: PutObjectCommandInput = {
      Bucket: this.AWS_S3_BUCKET_NAME,
      Key: `public/metadata/cnft/${id}.json`,
      Body: data,
      ContentType: 'application/json',
    };
    const command = new PutObjectCommand(input);
    await this.s3Client.send(command);
    return `${this.configService.get('AWS_S3_BUCKET_URL')}/${input.Key}`;
  }
}
