// server/src/dao/dynamo/DynamoStatusDao.ts
import { IStatusDao } from '../interfaces/IStatusDao';
import { Status, User } from 'tweeter-shared';
import { QueryCommand, PutCommand, GetCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDocClient } from './awsClients';

const STORY_TABLE = process.env.STORY_TABLE || 'TweeterStory';
const FEED_TABLE = process.env.FEED_TABLE || 'TweeterFeed';
const USERS_TABLE = process.env.USERS_TABLE || 'TweeterUsers';
const FOLLOWS_TABLE = process.env.FOLLOWS_TABLE || 'TweeterFollows';
const FOLLOWEE_INDEX = process.env.FOLLOWEE_INDEX || 'FolloweeIndex';
// Build bump to force redeploy and aid diagnostics
export const DYNAMO_STATUS_DAO_BUILD = '2025-12-08T17:03Z';

export class DynamoStatusDao implements IStatusDao {
  private readonly client = dynamoDocClient;

  public async getFeedItems(
    targetUserAlias: string | null,
    pageSize: number,
    lastTimestamp?: number | null,
  ): Promise<[Status[], boolean]> {
    if (!targetUserAlias) {
      return [[], false];
    }

    const params: any = {
      TableName: FEED_TABLE,
      KeyConditionExpression: 'userAlias = :u',
      ExpressionAttributeValues: { ':u': targetUserAlias },
      ScanIndexForward: false, // newest first
      Limit: pageSize,
    };

    if (lastTimestamp != null) {
      params.ExclusiveStartKey = {
        userAlias: targetUserAlias,
        timestamp: lastTimestamp,
      };
    }

    const resp: any = await this.client.send(new QueryCommand(params) as any);
    const items = resp.Items ?? [];

    const statuses: Status[] = items.map((item: any) => {
      const user = new User(
        item.authorFirstName,
        item.authorLastName,
        item.authorAlias,
        item.authorImageUrl,
      );
      return new Status(item.post, user, item.timestamp);
    });

    const hasMore = !!resp.LastEvaluatedKey;
    return [statuses, hasMore];
  }

  public async getStoryItems(
    targetUserAlias: string,
    pageSize: number,
    lastTimestamp?: number | null,
  ): Promise<[Status[], boolean]> {
    const params: any = {
      TableName: STORY_TABLE,
      KeyConditionExpression: 'userAlias = :u',
      ExpressionAttributeValues: { ':u': targetUserAlias },
      ScanIndexForward: false, // newest first
      Limit: pageSize,
    };

    if (lastTimestamp != null) {
      params.ExclusiveStartKey = {
        userAlias: targetUserAlias,
        timestamp: lastTimestamp,
      };
    }

    const resp: any = await this.client.send(new QueryCommand(params) as any);
    const items = resp.Items ?? [];

    const statuses: Status[] = items.map((item: any) => {
      const user = new User(
        item.userFirstName,
        item.userLastName,
        item.userAlias,
        item.userImageUrl,
      );
      return new Status(item.post, user, item.timestamp);
    });

    const hasMore = !!resp.LastEvaluatedKey;
    return [statuses, hasMore];
  }

  public async postStatus(authorAlias: string, post: string, timestamp: number): Promise<boolean> {
    const trim = (a: string) => (a || '').trim();
    const candidates = [] as string[];
    const base = trim(authorAlias);
    if (!base) return false;
    candidates.push(base); // 'CB'
    candidates.push(base.startsWith('@') ? base : `@${base}`); // '@CB'
    candidates.push(base.toLowerCase()); // 'cb'
    candidates.push((base.startsWith('@') ? base : `@${base}`).toLowerCase()); // '@cb'
    console.log('[DynamoStatusDao] postStatus alias candidates', { base, candidates });

    // 1) Get author info from Users table (try candidates in order)
    let authorKey: string | null = null;
    let userResp: any = null;
    for (const key of candidates) {
      const resp: any = await this.client.send(
        new GetCommand({ TableName: USERS_TABLE, Key: { alias: key } }) as any,
      );
      if (resp && resp.Item) {
        authorKey = key;
        userResp = resp;
        break;
      }
    }
    console.log('[DynamoStatusDao] postStatus matched author key', {
      authorKey,
      table: USERS_TABLE,
    });

    if (!authorKey || !userResp || !userResp.Item) {
      // Author doesn't exist under any candidate key
      return false;
    }

    const authorItem = userResp.Item;
    const authorFirstName = authorItem.firstName;
    const authorLastName = authorItem.lastName;
    const authorImageUrl = authorItem.imageUrl;

    // 2) Write to Story table
    await this.client.send(
      new PutCommand({
        TableName: STORY_TABLE,
        Item: {
          userAlias: authorKey,
          timestamp,
          post,
          userFirstName: authorFirstName,
          userLastName: authorLastName,
          userImageUrl: authorImageUrl,
        },
      }) as any,
    );

    // 3) Get followers from Follows table via GSI
    const followersResp: any = await this.client.send(
      new QueryCommand({
        TableName: FOLLOWS_TABLE,
        IndexName: FOLLOWEE_INDEX,
        KeyConditionExpression: 'followeeAlias = :e',
        ExpressionAttributeValues: { ':e': authorKey },
      }) as any,
    );

    const followerAliases: string[] = (followersResp.Items ?? []).map((i: any) => i.followerAlias);
    console.log('[DynamoStatusDao] followers count', { count: followerAliases.length });

    if (followerAliases.length === 0) {
      // No followers; nothing to fan out
      return true;
    }

    // 4) Batch write feed items to Feed table with retry for UnprocessedItems
    const chunkSize = 25;
    for (let i = 0; i < followerAliases.length; i += chunkSize) {
      const slice = followerAliases.slice(i, i + chunkSize);

      let requestItems: Record<string, any[]> = {
        [FEED_TABLE]: slice.map((fAlias) => ({
          PutRequest: {
            Item: {
              userAlias: fAlias, // the owner of this feed row
              timestamp,
              post,
              authorAlias: authorKey,
              authorFirstName,
              authorLastName,
              authorImageUrl,
            },
          },
        })),
      };

      const maxAttempts = 5;
      let attempt = 0;
      while (attempt < maxAttempts && requestItems[FEED_TABLE].length > 0) {
        const cmd = new BatchWriteCommand({ RequestItems: requestItems } as any);
        const resp: any = await this.client.send(cmd as any);
        const unprocessed = resp.UnprocessedItems?.[FEED_TABLE] ?? [];
        if (!unprocessed || unprocessed.length === 0) {
          break;
        }
        // Backoff before retrying only the unprocessed items
        const backoffMs = 100 * (attempt + 1);
        console.log('[DynamoStatusDao] BatchWrite backoff', {
          attempt,
          backoffMs,
          unprocessedCount: unprocessed.length,
        });
        await new Promise((r) => setTimeout(r, backoffMs));
        requestItems = { [FEED_TABLE]: unprocessed };
        attempt++;
      }
    }

    return true;
  }

  public async batchWriteFeedItems(
    items: {
      userAlias: string;
      timestamp: number;
      post: string;
      authorAlias: string;
      authorFirstName: string;
      authorLastName: string;
      authorImageUrl: string;
    }[],
  ): Promise<void> {
    const chunkSize = 25;
    for (let i = 0; i < items.length; i += chunkSize) {
      const slice = items.slice(i, i + chunkSize);
      let requestItems: Record<string, any[]> = {
        [FEED_TABLE]: slice.map((it) => ({
          PutRequest: { Item: it },
        })),
      };
      const maxAttempts = 5;
      let attempt = 0;
      while (attempt < maxAttempts && requestItems[FEED_TABLE].length > 0) {
        const cmd = new BatchWriteCommand({ RequestItems: requestItems } as any);
        const resp: any = await this.client.send(cmd as any);
        const unprocessed = resp.UnprocessedItems?.[FEED_TABLE] ?? [];
        if (!unprocessed || unprocessed.length === 0) break;
        await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
        requestItems = { [FEED_TABLE]: unprocessed };
        attempt++;
      }
    }
  }
}
