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
    );
    return this.serverFacade.getMoreStory(request);
  }

  public async postStatus(_authToken: AuthToken, _newStatus: Status): Promise<void> {
    // TODO: Replace with server call to post status
    // Simulate delay
    await new Promise((r) => setTimeout(r, 500));
  }
}
