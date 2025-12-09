import { AuthToken, User } from 'tweeter-shared';
import { Service } from './Service';
import { PagedUserItemRequest } from 'tweeter-shared/src/model/net/Request';
import { ServerFacade } from 'src/net/ServerFacade';

export class FollowService implements Service {
  private serverFacade = new ServerFacade();

  public async loadMoreFollowees(
    _authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastFollowee: User | null,
  ): Promise<[User[], boolean]> {
    const request = new PagedUserItemRequest(
      userAlias,
      pageSize,
      lastFollowee?.alias || null, // Use the alias as the 'lastItem'
      _authToken?.token || null,
    );

    // Call the ServerFacade method and return its result
    return this.serverFacade.getMoreFollowees(request);
  }

  public async loadMoreFollowers(
    _authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastFollower: User | null,
  ): Promise<[User[], boolean]> {
    const request = new PagedUserItemRequest(
      userAlias,
      pageSize,
      lastFollower?.alias || null,
      _authToken?.token || null,
    );
    return this.serverFacade.getMoreFollowers(request);
  }

  public async isFollower(
    _authToken: AuthToken,
    currentUser: User,
    displayedUser: User,
  ): Promise<boolean> {
    return this.serverFacade.isFollower(_authToken, currentUser.alias, displayedUser.alias);
  }

  public async getFolloweeCount(_authToken: AuthToken, user: User): Promise<number> {
    return this.serverFacade.getFolloweeCount(_authToken, user.alias);
  }

  public async getFollowerCount(_authToken: AuthToken, user: User): Promise<number> {
    return this.serverFacade.getFollowerCount(_authToken, user.alias);
  }

  public async follow(_authToken: AuthToken, userToFollow: User): Promise<[number, number]> {
    // Actor alias is derived on the server from the auth token; we can pass an empty string here.
    return this.serverFacade.follow(_authToken, '', userToFollow.alias);
  }

  public async unfollow(_authToken: AuthToken, userToUnfollow: User): Promise<[number, number]> {
    return this.serverFacade.unfollow(_authToken, '', userToUnfollow.alias);
  }
}
