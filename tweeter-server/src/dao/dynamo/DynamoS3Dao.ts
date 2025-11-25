import { IS3Dao } from '../interfaces/IS3Dao';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class DynamoS3Dao implements IS3Dao {
  private s3: S3Client;
  private bucket = process.env.S3_BUCKET || '';
  constructor() {
    this.s3 = new S3Client({});
  }
  public async uploadProfileImage(alias: string, imageBytes: Uint8Array, contentType: string): Promise<string> {
    if (!this.bucket) throw new Error('S3 bucket not configured');
    const key = `profiles/${alias}-${Date.now()}`;
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: imageBytes, ContentType: contentType, ACL: 'public-read' as any });
    await this.s3.send(cmd as any);
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
}
