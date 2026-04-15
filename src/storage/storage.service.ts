import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.GCP_BUCKET_NAME ?? 'iputa';

    this.client = new S3Client({
      endpoint: process.env.GCP_STORAGE_BASE_URL ?? 'https://storage.googleapis.com',
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.GCP_SERVICE_ACCOUNT_ACCESS_KEY!,
        secretAccessKey: process.env.GCP_SERVICE_ACCOUNT_SECRET!,
      },
      forcePathStyle: true,
    });
  }

  buildKey(folder: string, originalName: string): string {
    const ext = extname(originalName);
    return `${folder}/${randomUUID()}${ext}`;
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    this.logger.log(`Uploaded object: ${key}`);
    return key;
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.log(`Deleted object: ${key}`);
  }
}
