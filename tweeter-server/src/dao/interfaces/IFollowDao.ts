import { User } from 'tweeter-shared';

export interface IFollowDao {
  getFollowers(targetAlias: string, pageSize: number, lastAlias?: string | null): Promise<[User[], boolean]>;
  getFollowees(targetAlias: string, pageSize: number, lastAlias?: string | null): Promise<[User[], boolean]>;
  getFollowerCount(alias: string): Promise<number>;
  getFolloweeCount(alias: string): Promise<number>;
  follow(followerAlias: string, followeeAlias: string): Promise<void>;
  unfollow(followerAlias: string, followeeAlias: string): Promise<void>;
  isFollower(followerAlias: string, followeeAlias: string): Promise<boolean>;
}
