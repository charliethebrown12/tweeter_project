import {
  AliasRequest,
  AuthToken,
  BooleanResponse,
  CountResponse,
  FollowActionRequest,
  FollowCountsResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  User,
  UserDto,
} from 'tweeter-shared';
import { FollowService } from '../service/FollowService';
import { createRuntimeDaoFactory } from '../dao/RuntimeDaoFactory';

// Followers list (paged)
export const followersListHandler = async (event: any): Promise<any> => {
  const request: PagedUserItemRequest =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const factory = createRuntimeDaoFactory();
  const service = new FollowService(factory);
  const [users, hasMore] = await service.getMoreFollowers(request);
  const dtos: UserDto[] = users.map(
    (u) => new UserDto(u.firstName, u.lastName, u.alias, u.imageUrl),
  );
  const response = new PagedUserItemResponse(dtos, hasMore, true, null);
  return response;
};

// Is follower
export const isFollowerHandler = async (event: any): Promise<any> => {
  const req =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const factory = createRuntimeDaoFactory();
  const service = new FollowService(factory);
  const authToken: AuthToken = req.authToken;
  const currentUser = new User('', '', req.followerAlias, '');
  const displayedUser = new User('', '', req.followeeAlias, '');
  const value = await service.isFollower(authToken, currentUser, displayedUser);
  const response = new BooleanResponse(value, true, null);
  return response;
};

// Follow
export const followHandler = async (event: any): Promise<any> => {
  const req: FollowActionRequest =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const factory = createRuntimeDaoFactory();
  const service = new FollowService(factory);
  const authToken: AuthToken = req.authToken as unknown as AuthToken;
  const targetUser = new User('', '', req.targetAlias, '');
  const [followerCount, followeeCount] = await service.follow(authToken, targetUser);
  const response = new FollowCountsResponse(followerCount, followeeCount, true, null);
  return response;
};

// Unfollow
export const unfollowHandler = async (event: any): Promise<any> => {
  const req: FollowActionRequest =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const factory = createRuntimeDaoFactory();
  const service = new FollowService(factory);
  const authToken: AuthToken = req.authToken as unknown as AuthToken;
  const targetUser = new User('', '', req.targetAlias, '');
  const [followerCount, followeeCount] = await service.unfollow(authToken, targetUser);
  const response = new FollowCountsResponse(followerCount, followeeCount, true, null);
  return response;
};

// Follower count
export const followerCountHandler = async (event: any): Promise<any> => {
  const req: AliasRequest =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const factory = createRuntimeDaoFactory();
  const service = new FollowService(factory);
  const authToken: AuthToken = req.authToken as unknown as AuthToken;
  const targetUser = new User('', '', req.alias, '');
  const count = await service.getFollowerCount(authToken, targetUser);
  const response = new CountResponse(count, true, null);
  return response;
};

// Followee count
export const followeeCountHandler = async (event: any): Promise<any> => {
  const req: AliasRequest =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const factory = createRuntimeDaoFactory();
  const service = new FollowService(factory);
  const authToken: AuthToken = req.authToken as unknown as AuthToken;
  const targetUser = new User('', '', req.alias, '');
  const count = await service.getFolloweeCount(authToken, targetUser);
  const response = new CountResponse(count, true, null);
  return response;
};
