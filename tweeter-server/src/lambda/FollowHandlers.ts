import { AliasRequest, BooleanResponse, CountResponse, FollowActionRequest, FollowCountsResponse, PagedUserItemRequest, PagedUserItemResponse, UserDto } from 'tweeter-shared';
import { FollowService } from '../service/FollowService';

// Followers list (paged)
export const followersListHandler = async (event: any): Promise<any> => {
  const request: PagedUserItemRequest = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const service = new FollowService();
  const [users, hasMore] = await service.getMoreFollowers(request);
  const dtos: UserDto[] = users.map((u) => new UserDto(u.firstName, u.lastName, u.alias, u.imageUrl));
  const response = new PagedUserItemResponse(dtos, hasMore, true, null);
  return response;
};

// Is follower
export const isFollowerHandler = async (event: any): Promise<any> => {
  const req = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const service = new FollowService();
  const value = await service.isFollower(undefined as any, { firstName: '', lastName: '', alias: req.followerAlias, imageUrl: '' } as any, { firstName: '', lastName: '', alias: req.followeeAlias, imageUrl: '' } as any);
  const response = new BooleanResponse(value, true, null);
  return response;
};

// Follow
export const followHandler = async (event: any): Promise<any> => {
  const req: FollowActionRequest = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const service = new FollowService();
  const [followerCount, followeeCount] = await service.follow(undefined as any, { firstName: '', lastName: '', alias: req.targetAlias, imageUrl: '' } as any);
  const response = new FollowCountsResponse(followerCount, followeeCount, true, null);
  return response;
};

// Unfollow
export const unfollowHandler = async (event: any): Promise<any> => {
  const req: FollowActionRequest = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const service = new FollowService();
  const [followerCount, followeeCount] = await service.unfollow(undefined as any, { firstName: '', lastName: '', alias: req.targetAlias, imageUrl: '' } as any);
  const response = new FollowCountsResponse(followerCount, followeeCount, true, null);
  return response;
};

// Follower count
export const followerCountHandler = async (event: any): Promise<any> => {
  const req: AliasRequest = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const service = new FollowService();
  const count = await service.getFollowerCount(undefined as any, { firstName: '', lastName: '', alias: req.alias, imageUrl: '' } as any);
  const response = new CountResponse(count, true, null);
  return response;
};

// Followee count
export const followeeCountHandler = async (event: any): Promise<any> => {
  const req: AliasRequest = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const service = new FollowService();
  const count = await service.getFolloweeCount(undefined as any, { firstName: '', lastName: '', alias: req.alias, imageUrl: '' } as any);
  const response = new CountResponse(count, true, null);
  return response;
};
