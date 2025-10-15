import { AuthToken, Status, FakeData } from 'tweeter-shared';
import { Service } from './Service';

export class StatusService implements Service {
  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<[Status[], boolean]> {
    // TODO: Replace with the result of calling server
    return FakeData.instance.getPageOfStatuses(lastItem, pageSize);
  }

  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<[Status[], boolean]> {
    // TODO: Replace with the result of calling server
    return FakeData.instance.getPageOfStatuses(lastItem, pageSize);
  }

  public async postStatus(_authToken: AuthToken, _newStatus: Status): Promise<void> {
    // TODO: Replace with server call to post status
    // Simulate delay
    await new Promise((r) => setTimeout(r, 500));
  }
}
