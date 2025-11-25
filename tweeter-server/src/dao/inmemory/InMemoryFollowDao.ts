import { IFollowDao } from '../interfaces/IFollowDao';
import { FakeData, User } from 'tweeter-shared';

export class InMemoryFollowDao implements IFollowDao {
  public async getFollowers(targetAlias: string, pageSize: number, lastAlias?: string | null): Promise<[User[], boolean]> {
    const lastUser = lastAlias ? FakeData.instance.findUserByAlias(lastAlias) : null;
    return FakeData.instance.getPageOfUsers(lastUser, pageSize, targetAlias);
  }
  public async getFollowees(targetAlias: string, pageSize: number, lastAlias?: string | null): Promise<[User[], boolean]> {
    const lastUser = lastAlias ? FakeData.instance.findUserByAlias(lastAlias) : null;
    return FakeData.instance.getPageOfUsers(lastUser, pageSize, targetAlias);
  }
  public async getFollowerCount(alias: string): Promise<number> {
    return FakeData.instance.getFollowerCount(alias);
  }
  public async getFolloweeCount(alias: string): Promise<number> {
    return FakeData.instance.getFolloweeCount(alias);
  }
  public async follow(followerAlias: string, followeeAlias: string): Promise<void> {
    // FakeData doesn't persist follow relationships; no-op for now
    return;
  }
  public async unfollow(followerAlias: string, followeeAlias: string): Promise<void> {
    return;
  }
  public async isFollower(followerAlias: string, followeeAlias: string): Promise<boolean> {
    return FakeData.instance.isFollower();
  }
}
