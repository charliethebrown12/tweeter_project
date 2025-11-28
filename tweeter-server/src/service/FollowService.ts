// server/src/service/FollowService.ts
import { AuthToken, User } from 'tweeter-shared';
import { PagedUserItemRequest } from 'tweeter-shared/src/model/net/Request';
import { IDaoFactory } from '../dao/interfaces/IDaoFactory';
import { AuthorizationService } from './AuthorizationService';

export class FollowService {
  private readonly followDao;
  private readonly authService: AuthorizationService;

  constructor(private readonly factory: IDaoFactory) {
    this.followDao = this.factory.createFollowDao();
    this.authService = new AuthorizationService(this.factory);
  }

  public async getMoreFollowees(request: PagedUserItemRequest): Promise<[User[], boolean]> {
    await this.authService.authorize(request.authToken as any);

    return this.followDao.getFollowees(
      request.targetUserAlias,
      request.pageSize,
      request.lastItemAlias || null,
    );
  }

  public async getMoreFollowers(request: PagedUserItemRequest): Promise<[User[], boolean]> {
    await this.authService.authorize(request.authToken as any);

    return this.followDao.getFollowers(
      request.targetUserAlias,
      request.pageSize,
      request.lastItemAlias || null,
    );
  }

  public async isFollower(
    auth: AuthToken | string | null,
    currentUser: User,
    displayedUser: User,
  ): Promise<boolean> {
    await this.authService.authorize(auth);
    return this.followDao.isFollower(currentUser.alias, displayedUser.alias);
  }

  public async getFolloweeCount(auth: AuthToken | string | null, user: User): Promise<number> {
    await this.authService.authorize(auth);
    return this.followDao.getFolloweeCount(user.alias);
  }

  public async getFollowerCount(auth: AuthToken | string | null, user: User): Promise<number> {
    await this.authService.authorize(auth);
    return this.followDao.getFollowerCount(user.alias);
  }

  public async follow(
    auth: AuthToken | string | null,
    userToFollow: User,
  ): Promise<[number, number]> {
    const followerAlias = await this.authService.authorize(auth);

    await this.followDao.follow(followerAlias, userToFollow.alias);

    const followerCount = await this.getFollowerCount(auth, userToFollow);
    const followeeCount = await this.getFolloweeCount(auth, userToFollow);

    return [followerCount, followeeCount];
  }

  public async unfollow(
    auth: AuthToken | string | null,
    userToUnfollow: User,
  ): Promise<[number, number]> {
    const followerAlias = await this.authService.authorize(auth);

    await this.followDao.unfollow(followerAlias, userToUnfollow.alias);

    const followerCount = await this.getFollowerCount(auth, userToUnfollow);
    const followeeCount = await this.getFolloweeCount(auth, userToUnfollow);

    return [followerCount, followeeCount];
  }
}
