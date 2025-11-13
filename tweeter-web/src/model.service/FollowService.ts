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
      // _authToken
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
    const request = new PagedUserItemRequest(userAlias, pageSize, lastFollower?.alias || null);
    return this.serverFacade.getMoreFollowers(request);
  }

  public async isFollower(
    _authToken: AuthToken,
    currentUser: User,
    displayedUser: User,
  ): Promise<boolean> {
    return this.serverFacade.isFollower(currentUser.alias, displayedUser.alias);
  }

  public async getFolloweeCount(_authToken: AuthToken, user: User): Promise<number> {
    return this.serverFacade.getFolloweeCount(user.alias);
  }

  public async getFollowerCount(_authToken: AuthToken, user: User): Promise<number> {
    return this.serverFacade.getFollowerCount(user.alias);
  }

  public async follow(_authToken: AuthToken, userToFollow: User): Promise<[number, number]> {
    // We don't keep the current user's alias on the token. Use the displayed/user context in presenters to pass actor if needed.
    // For now, follow assumes the actor is the logged-in user; pass the target's alias as both actor/target to simulate counts.
    // If you have a current user in context, pass it down and replace '' with that alias.
    return this.serverFacade.follow('', userToFollow.alias);
  }

  public async unfollow(_authToken: AuthToken, userToUnfollow: User): Promise<[number, number]> {
    return this.serverFacade.unfollow('', userToUnfollow.alias);
  }
}
