import { IStatusDao } from '../interfaces/IStatusDao';
import { FakeData, Status } from 'tweeter-shared';

export class InMemoryStatusDao implements IStatusDao {
  public async getFeedItems(targetUserAlias: string | null, pageSize: number, lastTimestamp?: number | null): Promise<[Status[], boolean]> {
    const lastStatus: Status | null = lastTimestamp != null ? FakeData.instance.fakeStatuses.find((s) => s.timestamp === lastTimestamp) || null : null;
    return FakeData.instance.getPageOfStatuses(lastStatus, pageSize);
  }

  public async getStoryItems(targetUserAlias: string, pageSize: number, lastTimestamp?: number | null): Promise<[Status[], boolean]> {
    const lastStatus: Status | null = lastTimestamp != null ? FakeData.instance.fakeStatuses.find((s) => s.timestamp === lastTimestamp) || null : null;
    return FakeData.instance.getPageOfStatuses(lastStatus, pageSize);
  }

  public async postStatus(authorAlias: string, post: string, timestamp: number): Promise<boolean> {
    const user = FakeData.instance.findUserByAlias(authorAlias) || FakeData.instance.firstUser;
    if (!user) return false;
    const status = new Status(post, user, timestamp);
    FakeData.instance.fakeStatuses.push(status);
    return true;
  }

    public async batchWriteFeedItems(items: {
      userAlias: string;
      timestamp: number;
      post: string;
      authorAlias: string;
      authorFirstName: string;
      authorLastName: string;
      authorImageUrl: string;
    }[]): Promise<void> {
      // no-op for in-memory implementation
      return;
    }
}
