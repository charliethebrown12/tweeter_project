import { IFollowDao } from '../interfaces/IFollowDao';
import { User } from 'tweeter-shared';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb';

const FOLLOWS_TABLE = process.env.FOLLOWS_TABLE || 'TweeterFollows';
const USERS_TABLE = process.env.USERS_TABLE || 'TweeterUsers';
const FOLLOWEE_INDEX = process.env.FOLLOWEE_INDEX || 'FolloweeIndex';

export class DynamoFollowDao implements IFollowDao {
  private readonly client: DynamoDBDocumentClient;

  constructor() {
    const c = new DynamoDBClient({});
    this.client = DynamoDBDocumentClient.from(c);
  }

  public async follow(followerAlias: string, followeeAlias: string): Promise<void> {
    const cmd = new PutCommand({
      TableName: FOLLOWS_TABLE,
      Item: {
        followerAlias,
        followeeAlias,
      },
      ConditionExpression:
        'attribute_not_exists(followerAlias) AND attribute_not_exists(followeeAlias)',
    });

    await this.client.send(cmd as any);
  }

  public async unfollow(followerAlias: string, followeeAlias: string): Promise<void> {
    const cmd = new DeleteCommand({
      TableName: FOLLOWS_TABLE,
      Key: {
        followerAlias,
        followeeAlias,
      },
    });

    await this.client.send(cmd as any);
  }

  public async isFollower(followerAlias: string, followeeAlias: string): Promise<boolean> {
    const cmd = new QueryCommand({
      TableName: FOLLOWS_TABLE,
      KeyConditionExpression: 'followerAlias = :f AND followeeAlias = :e',
      ExpressionAttributeValues: {
        ':f': followerAlias,
        ':e': followeeAlias,
      },
      Limit: 1,
    });

    const resp: any = await this.client.send(cmd as any);
    return !!(resp.Items && resp.Items.length > 0);
  }

  public async getFollowees(
    targetAlias: string,
    pageSize: number,
    lastAlias?: string | null,
  ): Promise<[User[], boolean]> {
    const params: any = {
      TableName: FOLLOWS_TABLE,
      KeyConditionExpression: 'followerAlias = :f',
      ExpressionAttributeValues: { ':f': targetAlias },
      Limit: pageSize,
    };

    if (lastAlias) {
      params.ExclusiveStartKey = {
        followerAlias: targetAlias,
        followeeAlias: lastAlias,
      };
    }

    const resp: any = await this.client.send(new QueryCommand(params) as any);
    const items = resp.Items ?? [];
    const followeeAliases: string[] = items.map((i: any) => i.followeeAlias);

    const users = await this.batchGetUsers(followeeAliases);
    const hasMore = !!resp.LastEvaluatedKey;

    return [users, hasMore];
  }

  public async getFollowers(
    targetAlias: string,
    pageSize: number,
    lastAlias?: string | null,
  ): Promise<[User[], boolean]> {
    const params: any = {
      TableName: FOLLOWS_TABLE,
      IndexName: FOLLOWEE_INDEX,
      KeyConditionExpression: 'followeeAlias = :e',
      ExpressionAttributeValues: { ':e': targetAlias },
      Limit: pageSize,
    };

    if (lastAlias) {
      params.ExclusiveStartKey = {
        followeeAlias: targetAlias,
        followerAlias: lastAlias,
      };
    }

    const resp: any = await this.client.send(new QueryCommand(params) as any);
    const items = resp.Items ?? [];
    const followerAliases: string[] = items.map((i: any) => i.followerAlias);

    const users = await this.batchGetUsers(followerAliases);
    const hasMore = !!resp.LastEvaluatedKey;

    return [users, hasMore];
  }

  public async getFollowerCount(alias: string): Promise<number> {
    const cmd = new QueryCommand({
      TableName: FOLLOWS_TABLE,
      IndexName: FOLLOWEE_INDEX,
      KeyConditionExpression: 'followeeAlias = :e',
      ExpressionAttributeValues: {
        ':e': alias,
      },
      Select: 'COUNT',
    });

    const resp: any = await this.client.send(cmd as any);
    return resp.Count ?? 0;
  }

  public async getFolloweeCount(alias: string): Promise<number> {
    const cmd = new QueryCommand({
      TableName: FOLLOWS_TABLE,
      KeyConditionExpression: 'followerAlias = :f',
      ExpressionAttributeValues: {
        ':f': alias,
      },
      Select: 'COUNT',
    });

    const resp: any = await this.client.send(cmd as any);
    return resp.Count ?? 0;
  }

  /**
   * Helper: Batch-get users from the Users table and map to tweeter-shared User.
   */
  private async batchGetUsers(aliases: string[]): Promise<User[]> {
    if (aliases.length === 0) return [];

    const keys = aliases.map((alias) => ({ alias }));

    const cmd = new BatchGetCommand({
      RequestItems: {
        [USERS_TABLE]: {
          Keys: keys,
        },
      },
    });

    const resp: any = await this.client.send(cmd as any);
    const items = resp.Responses?.[USERS_TABLE] ?? [];

    return items.map(
      (item: any) => new User(item.firstName, item.lastName, item.alias, item.imageUrl),
    );
  }
}
