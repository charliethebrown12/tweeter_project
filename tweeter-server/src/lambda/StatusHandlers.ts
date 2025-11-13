import { PagedStatusItemRequest, PagedStatusItemResponse } from 'tweeter-shared';
import { Status } from 'tweeter-shared';
import { StatusService } from '../service/StatusService';

// Feed list (paged)
export const feedListHandler = async (event: any): Promise<any> => {
  const request: PagedStatusItemRequest =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;

  const service = new StatusService();
  const [items, hasMore] = await service.getMoreFeedItems(request);
  const dtos = items.map((s: Status) => ({
    post: s.post,
    userAlias: s.user.alias,
    userFirstName: s.user.firstName,
    userLastName: s.user.lastName,
    userImageUrl: s.user.imageUrl,
    timestamp: s.timestamp,
  }));
  const response = new PagedStatusItemResponse(dtos, hasMore, true, null);
  return response;
};

// Story list (paged)
export const storyListHandler = async (event: any): Promise<any> => {
  const request: PagedStatusItemRequest =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;

  const service = new StatusService();
  const [items, hasMore] = await service.getMoreStoryItems(request);
  const dtos = items.map((s: Status) => ({
    post: s.post,
    userAlias: s.user.alias,
    userFirstName: s.user.firstName,
    userLastName: s.user.lastName,
    userImageUrl: s.user.imageUrl,
    timestamp: s.timestamp,
  }));
  const response = new PagedStatusItemResponse(dtos, hasMore, true, null);
  return response;
};
