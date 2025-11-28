// server/src/dao/dynamo/DynamoStatusDao.ts
import { IStatusDao } from '../interfaces/IStatusDao';
import { Status, User } from 'tweeter-shared';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  GetCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';

const STORY_TABLE = process.env.STORY_TABLE || 'TweeterStory';
const FEED_TABLE = process.env.FEED_TABLE || 'TweeterFeed';
const USERS_TABLE = process.env.USERS_TABLE || 'TweeterUsers';
const FOLLOWS_TABLE = process.env.FOLLOWS_TABLE || 'TweeterFollows';
const FOLLOWEE_INDEX = process.env.FOLLOWEE_INDEX || 'FolloweeIndex';

export class DynamoStatusDao implements IStatusDao {
  private readonly client: DynamoDBDocumentClient;

  constructor() {
    const c = new DynamoDBClient({});
    this.client = DynamoDBDocumentClient.from(c);
  }

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
    // 1) Get author info from Users table
    const userResp: any = await this.client.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { alias: authorAlias },
      }) as any,
    );

    if (!userResp || !userResp.Item) {
      // Author doesn't exist
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
          userAlias: authorAlias,
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
        ExpressionAttributeValues: { ':e': authorAlias },
      }) as any,
    );

    const followerAliases: string[] = (followersResp.Items ?? []).map((i: any) => i.followerAlias);

    if (followerAliases.length === 0) {
      // No followers; nothing to fan out
      return true;
    }

    // 4) Batch write feed items to Feed table
    const writePromises: Promise<any>[] = [];
    const chunkSize = 25;

    for (let i = 0; i < followerAliases.length; i += chunkSize) {
      const slice = followerAliases.slice(i, i + chunkSize);

      const putRequests = slice.map((fAlias) => ({
        PutRequest: {
          Item: {
            userAlias: fAlias, // the owner of this feed row
            timestamp,
            post,
            authorAlias,
            authorFirstName,
            authorLastName,
            authorImageUrl,
          },
        },
      }));

      const cmd = new BatchWriteCommand({
        RequestItems: {
          [FEED_TABLE]: putRequests,
        },
      } as any);

      writePromises.push(this.client.send(cmd as any));
    }

    if (writePromises.length > 0) {
      await Promise.all(writePromises);
    }

    return true;
  }
}
