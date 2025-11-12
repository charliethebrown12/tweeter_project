import { UserDto, PagedUserItemRequest, PagedUserItemResponse } from 'tweeter-shared';
import { FollowService } from '../service/FollowService';

// The handler function
export const handler = async (event: any): Promise<any> => {
  // 1. Parse the request (supports proxy and non-proxy integrations)
  const request: PagedUserItemRequest =
    typeof event === 'string'
      ? JSON.parse(event)
      : event?.body
        ? JSON.parse(event.body)
        : (event as PagedUserItemRequest);

  // 2. Delegate to the service
  // (You'll need to instantiate your service)
  const service = new FollowService();
  const [users, hasMore] = await service.getMoreFollowees(request);

  const dtos: UserDto[] = users.map(
    (user) => new UserDto(user.firstName, user.lastName, user.alias, user.imageUrl),
  );

  // 3. Create and return the response (non-proxy integration: return the object directly)
  const response = new PagedUserItemResponse(dtos, hasMore, true, null);
  return response;
};
