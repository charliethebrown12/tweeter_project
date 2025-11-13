import { PagedStatusItemRequest } from 'tweeter-shared';
import { FakeData, Status, User } from 'tweeter-shared';

export class StatusService {
  public async getMoreFeedItems(request: PagedStatusItemRequest): Promise<[Status[], boolean]> {
    // For M3, ignore target user and just page statuses. Use exact last status by timestamp so equals() matches.
    const lastStatus: Status | null =
      request.lastItemTimestamp != null
        ? FakeData.instance.fakeStatuses.find((s) => s.timestamp === request.lastItemTimestamp) ||
          null
        : null;
    return FakeData.instance.getPageOfStatuses(lastStatus, request.pageSize);
  }

  public async getMoreStoryItems(request: PagedStatusItemRequest): Promise<[Status[], boolean]> {
    const lastStatus: Status | null =
      request.lastItemTimestamp != null
        ? FakeData.instance.fakeStatuses.find((s) => s.timestamp === request.lastItemTimestamp) ||
          null
        : null;
    return FakeData.instance.getPageOfStatuses(lastStatus, request.pageSize);
  }

  public async postStatus(authToken: string, post: string): Promise<boolean> {
    // For M3, simulate posting by pushing to fake list with current time and first fake user
    const user: User | null = FakeData.instance.firstUser;
    if (!user) return false;
    const status = new Status(post, user, Date.now());
    FakeData.instance.fakeStatuses.push(status);
    return true;
  }
}
