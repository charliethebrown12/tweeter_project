import { AuthToken, User } from 'tweeter-shared';
import { PagedUserItemRequest } from 'tweeter-shared/src/model/net/Request';
import { IDaoFactory } from '../dao/interfaces/IDaoFactory';

// This is the SERVER-SIDE service. It does the REAL work.
export class FollowService {
  private followDao;
  constructor(private factory: IDaoFactory) {
    this.followDao = this.factory.createFollowDao();
  }
  /**
   * This method matches the one we've been building for the 'getFollowees'
   * feature. The Lambda handler will parse the 'PagedUserItemRequest'
   * and pass it directly to this method.
   */
  public async getMoreFollowees(request: PagedUserItemRequest): Promise<[User[], boolean]> {
    // We need to get the 'lastFollowee' as a User object to pass to FakeData,
    // but the request only gives us the alias (string).
  return this.followDao.getFollowees(request.targetUserAlias, request.pageSize, request.lastItemAlias || null);
  }

  /**
   * Return a page of followers for the target user.
   */
  public async getMoreFollowers(request: PagedUserItemRequest): Promise<[User[], boolean]> {
  return this.followDao.getFollowers(request.targetUserAlias, request.pageSize, request.lastItemAlias || null);
  }

  /**
   * These other methods are not yet refactored to use request objects.
   * Their Lambda handlers will parse the request and call these methods
   * with the original M2 parameters.
   */

  public async loadMoreFollowers(
    _authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastFollower: User | null,
  ): Promise<[User[], boolean]> {
  return this.followDao.getFollowers(userAlias, pageSize, lastFollower ? lastFollower.alias : null);
  }

  public async isFollower(
    _authToken: AuthToken,
    _currentUser: User,
    _displayedUser: User,
  ): Promise<boolean> {
  return this.followDao.isFollower(_currentUser.alias, _displayedUser.alias);
  }

  public async getFolloweeCount(_authToken: AuthToken, user: User): Promise<number> {
  return this.followDao.getFolloweeCount(user.alias);
  }

  public async getFollowerCount(_authToken: AuthToken, user: User): Promise<number> {
  return this.followDao.getFollowerCount(user.alias);
  }

  public async follow(_authToken: AuthToken, userToFollow: User): Promise<[number, number]> {
  await new Promise((r) => setTimeout(r, 200));
  await this.followDao.follow((_authToken as unknown) as string, userToFollow.alias);
  const followerCount = await this.getFollowerCount(_authToken, userToFollow);
  const followeeCount = await this.getFolloweeCount(_authToken, userToFollow);
  return [followerCount, followeeCount];
  }

  public async unfollow(_authToken: AuthToken, userToUnfollow: User): Promise<[number, number]> {
  await new Promise((r) => setTimeout(r, 200));
  await this.followDao.unfollow((_authToken as unknown) as string, userToUnfollow.alias);
  const followerCount = await this.getFollowerCount(_authToken, userToUnfollow);
  const followeeCount = await this.getFolloweeCount(_authToken, userToUnfollow);
  return [followerCount, followeeCount];
  }
}