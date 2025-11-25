import { IFollowDao } from '../interfaces/IFollowDao';
import { User } from 'tweeter-shared';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export class DynamoFollowDao implements IFollowDao {
  constructor() {}
  public async getFollowers(targetAlias: string, pageSize: number, lastAlias?: string | null): Promise<[User[], boolean]> { return [[], false]; }
  public async getFollowees(targetAlias: string, pageSize: number, lastAlias?: string | null): Promise<[User[], boolean]> { return [[], false]; }
  public async getFollowerCount(alias: string): Promise<number> { return 0; }
  public async getFolloweeCount(alias: string): Promise<number> { return 0; }
  public async follow(followerAlias: string, followeeAlias: string): Promise<void> { return; }
  public async unfollow(followerAlias: string, followeeAlias: string): Promise<void> { return; }
  public async isFollower(followerAlias: string, followeeAlias: string): Promise<boolean> { return false; }
}
