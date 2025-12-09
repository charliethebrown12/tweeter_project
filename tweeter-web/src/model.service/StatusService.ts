import { AuthToken, Status } from 'tweeter-shared';
import { Service } from './Service';
import { PagedStatusItemRequest } from 'tweeter-shared/src/model/net/Request';
import { ServerFacade } from 'src/net/ServerFacade';

export class StatusService implements Service {
  private serverFacade = new ServerFacade();
  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<[Status[], boolean]> {
    const request = new PagedStatusItemRequest(
      userAlias,
      pageSize,
      lastItem ? lastItem.timestamp : null,
      authToken?.token || null,
    );
    return this.serverFacade.getMoreFeed(request);
  }

  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<[Status[], boolean]> {
    const request = new PagedStatusItemRequest(
      userAlias,
      pageSize,
      lastItem ? lastItem.timestamp : null,
      authToken?.token || null,
    );
    return this.serverFacade.getMoreStory(request);
  }

  public async postStatus(_authToken: AuthToken, _newStatus: Status): Promise<void> {
  if (!_authToken || !_authToken.token) throw new Error('Not authenticated');
  if (!_newStatus || !_newStatus.post?.trim()) throw new Error('Post text is required');
  await this.serverFacade.postStatus(_authToken.token, _newStatus.post);
  }
}
