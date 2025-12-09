import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

// Singletons reused across modules/handlers
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';

// Base Dynamo client
const dynamoBase = new DynamoDBClient({ region });

// Document client for lib-dynamodb
export const dynamoDocClient = DynamoDBDocumentClient.from(dynamoBase);

// S3 client
export const s3Client = new S3Client({ region });
