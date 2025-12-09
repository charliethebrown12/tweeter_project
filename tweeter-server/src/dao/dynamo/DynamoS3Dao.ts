import { IS3Dao } from '../interfaces/IS3Dao';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './awsClients';

export class DynamoS3Dao implements IS3Dao {
  private s3 = s3Client;
  private bucket = process.env.S3_BUCKET || '';
  constructor() {}
  public async uploadProfileImage(
    alias: string,
    imageBytes: Uint8Array,
    contentType: string,
  ): Promise<string> {
    if (!this.bucket) throw new Error('S3 bucket not configured');
    const key = `image/${alias}-${Date.now()}`;
    // Make object public via ACL (requires bucket to allow ACLs and not block public access at bucket/account level)
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: imageBytes,
      ContentType: contentType,
      ACL: 'public-read',
    });
    await this.s3.send(cmd as any);
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
