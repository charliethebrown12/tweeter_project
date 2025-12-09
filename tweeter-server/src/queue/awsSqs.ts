import { SQSClient, SendMessageBatchCommand, SendMessageCommand } from '@aws-sdk/client-sqs';

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
export const sqsClient = new SQSClient({ region });

export interface PostMessage {
  authorAlias: string;
  post: string;
  timestamp: number;
}

export interface FanOutJobMessage {
  post: string;
  timestamp: number;
  authorAlias: string;
  authorFirstName: string;
  authorLastName: string;
  authorImageUrl: string;
  followerAliases: string[];
}

export async function enqueuePost(queueUrl: string, msg: PostMessage) {
  const cmd = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(msg),
  });
  await sqsClient.send(cmd);
}

export async function enqueueFanOutJobs(queueUrl: string, jobs: FanOutJobMessage[]) {
  // Batch in groups of 10 per API limits
  for (let i = 0; i < jobs.length; i += 10) {
    const slice = jobs.slice(i, i + 10);
    const entries = slice.map((job, idx) => ({
      Id: `${Date.now()}-${i}-${idx}`,
      MessageBody: JSON.stringify(job),
    }));
    const cmd = new SendMessageBatchCommand({ QueueUrl: queueUrl, Entries: entries });
    await sqsClient.send(cmd);
  }
}
