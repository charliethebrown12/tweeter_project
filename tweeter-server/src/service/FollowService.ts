import { AuthToken, User, FakeData, } from 'tweeter-shared';
import { PagedUserItemRequest } from 'tweeter-shared/src/model/net/Request';

// This is the SERVER-SIDE service. It does the REAL work.
export class FollowService {
  /**
   * This method matches the one we've been building for the 'getFollowees'
   * feature. The Lambda handler will parse the 'PagedUserItemRequest'
   * and pass it directly to this method.
   */
  public async getMoreFollowees(request: PagedUserItemRequest): Promise<[User[], boolean]> {
    // We need to get the 'lastFollowee' as a User object to pass to FakeData,
    // but the request only gives us the alias (string).
    let lastFollowee: User | null = null;
    if (request.lastItemAlias) {
      // We assume FakeData has a method to find a user by their alias.
      lastFollowee = FakeData.instance.findUserByAlias(request.lastItemAlias);
    }

    // Call FakeData with the parameters from the request
    return FakeData.instance.getPageOfUsers(
      lastFollowee,
      request.pageSize,
      request.targetUserAlias,
    );
  }

  /**
   * Return a page of followers for the target user.
   */
  public async getMoreFollowers(request: PagedUserItemRequest): Promise<[User[], boolean]> {
    let lastFollower: User | null = null;
    if (request.lastItemAlias) {
      lastFollower = FakeData.instance.findUserByAlias(request.lastItemAlias);
    }

    return FakeData.instance.getPageOfUsers(
      lastFollower,
      request.pageSize,
      request.targetUserAlias,
    );
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
    return FakeData.instance.getPageOfUsers(lastFollower, pageSize, userAlias);
  }

  public async isFollower(
    _authToken: AuthToken,
    _currentUser: User,
    _displayedUser: User,
  ): Promise<boolean> {
    return FakeData.instance.isFollower();
  }

  public async getFolloweeCount(_authToken: AuthToken, user: User): Promise<number> {
    return FakeData.instance.getFolloweeCount(user.alias);
  }

  public async getFollowerCount(_authToken: AuthToken, user: User): Promise<number> {
    return FakeData.instance.getFollowerCount(user.alias);
  }

  public async follow(_authToken: AuthToken, userToFollow: User): Promise<[number, number]> {
    await new Promise((r) => setTimeout(r, 200));
    const followerCount = await this.getFollowerCount(_authToken, userToFollow);
    const followeeCount = await this.getFolloweeCount(_authToken, userToFollow);
    return [followerCount, followeeCount];
  }

  public async unfollow(_authToken: AuthToken, userToUnfollow: User): Promise<[number, number]> {
    await new Promise((r) => setTimeout(r, 200));
    const followerCount = await this.getFollowerCount(_authToken, userToUnfollow);
    const followeeCount = await this.getFolloweeCount(_authToken, userToUnfollow);
    return [followerCount, followeeCount];
  }
}