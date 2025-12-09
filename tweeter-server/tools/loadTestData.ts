import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchWriteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
const USERS_TABLE = process.env.USERS_TABLE || 'TweeterUsers';
const FOLLOWS_TABLE = process.env.FOLLOWS_TABLE || 'TweeterFollows';

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

async function batchWriteWithRetry(requestItems: Record<string, any[]>, maxAttempts = 8) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    const resp: any = await doc.send(new BatchWriteCommand({ RequestItems: requestItems } as any));
    const unprocessed: Record<string, any[]> = resp.UnprocessedItems || {};
    const count = Object.values(unprocessed).reduce((acc, arr) => acc + (arr?.length || 0), 0);
    if (count === 0) return;
    await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    requestItems = unprocessed;
    attempt++;
  }
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function createUsers(count = 10000) {
  const puts = Array.from({ length: count }, (_, i) => {
    const alias = `@user${i + 1}`;
    return {
      PutRequest: {
        Item: {
          alias,
          firstName: 'User',
          lastName: `${i + 1}`,
          imageUrl: 'https://example.com/default.png',
        },
      },
    };
  });
  for (const batch of chunk(puts, 25)) {
    await batchWriteWithRetry({ [USERS_TABLE]: batch });
  }
}

async function createFollowers(celebrityAlias = '@celebrity', followerCount = 10000) {
  const puts = Array.from({ length: followerCount }, (_, i) => {
    const followerAlias = `@user${i + 1}`;
    return {
      PutRequest: {
        Item: {
          followerAlias,
          followeeAlias: celebrityAlias,
        },
      },
    };
  });
  for (const batch of chunk(puts, 25)) {
    await batchWriteWithRetry({ [FOLLOWS_TABLE]: batch });
  }
}

async function main() {
  const celebAlias = process.env.CELEB_ALIAS || '@celebrity';
  const count = Number(process.env.USER_COUNT || '10000');
  console.log(`Creating ${count} users and ${count} followers for ${celebAlias}...`);
  await createUsers(count);
  await createFollowers(celebAlias, count);
  console.log('Done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
