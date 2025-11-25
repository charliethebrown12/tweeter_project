import { PagedStatusItemRequest, Status } from 'tweeter-shared';
import { IDaoFactory } from '../dao/interfaces/IDaoFactory';

export class StatusService {
  private statusDao;
  constructor(private factory: IDaoFactory) {
    this.statusDao = this.factory.createStatusDao();
  }

  public async getMoreFeedItems(request: PagedStatusItemRequest): Promise<[Status[], boolean]> {
    return this.statusDao.getFeedItems(request.targetUserAlias || null, request.pageSize, request.lastItemTimestamp || null);
  }

  public async getMoreStoryItems(request: PagedStatusItemRequest): Promise<[Status[], boolean]> {
    return this.statusDao.getStoryItems(request.targetUserAlias || '', request.pageSize, request.lastItemTimestamp || null);
  }

  public async postStatus(authToken: string, post: string): Promise<boolean> {
    // For M4: still using FakeData via InMemory DAO; we use authToken only to determine author in later phases.
    const timestamp = Date.now();
    const authorAlias = null as unknown as string; // M3 preserved behavior: use first user inside DAO
    return this.statusDao.postStatus(authorAlias, post, timestamp);
  }
}
