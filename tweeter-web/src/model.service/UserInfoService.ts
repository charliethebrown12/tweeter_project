import { AuthToken, User, FakeData } from 'tweeter-shared';

export class UserInfoService {
  public async isFollower(
    _authToken: AuthToken,
    _currentUser: User,
    _displayedUser: User,
  ): Promise<boolean> {
    // TODO: Replace with server call
    return FakeData.instance.isFollower();
  }

  public async getFolloweeCount(_authToken: AuthToken, user: User): Promise<number> {
    // TODO: Replace with server call
    return FakeData.instance.getFolloweeCount(user.alias);
  }

  public async getFollowerCount(_authToken: AuthToken, user: User): Promise<number> {
    // TODO: Replace with server call
    return FakeData.instance.getFollowerCount(user.alias);
  }

  public async follow(_authToken: AuthToken, userToFollow: User): Promise<[number, number]> {
    // TODO: Call server to follow user. For now simulate and return refreshed counts.
    // Simulate small delay to mimic network
    await new Promise((r) => setTimeout(r, 200));
    const followerCount = await this.getFollowerCount(_authToken, userToFollow);
    const followeeCount = await this.getFolloweeCount(_authToken, userToFollow);
    return [followerCount, followeeCount];
  }

  public async unfollow(_authToken: AuthToken, userToUnfollow: User): Promise<[number, number]> {
    // TODO: Call server to unfollow user. For now simulate and return refreshed counts.
    await new Promise((r) => setTimeout(r, 200));
    const followerCount = await this.getFollowerCount(_authToken, userToUnfollow);
    const followeeCount = await this.getFolloweeCount(_authToken, userToUnfollow);
    return [followerCount, followeeCount];
  }
}
