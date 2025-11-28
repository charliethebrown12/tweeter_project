import { PagedStatusItemRequest, Status, AuthToken } from 'tweeter-shared';
import { IDaoFactory } from '../dao/interfaces/IDaoFactory';
import { AuthorizationService } from './AuthorizationService';

export class StatusService {
  private readonly statusDao;
  private readonly authService: AuthorizationService;

  constructor(private readonly factory: IDaoFactory) {
    this.statusDao = this.factory.createStatusDao();
    this.authService = new AuthorizationService(this.factory);
  }

  public async getMoreFeedItems(request: PagedStatusItemRequest): Promise<[Status[], boolean]> {
    const callerAlias = await this.authService.authorize(request.authToken as any);

    const targetAlias = request.targetUserAlias || callerAlias;

    return this.statusDao.getFeedItems(
      targetAlias,
      request.pageSize,
      request.lastItemTimestamp || null,
    );
  }

  public async getMoreStoryItems(request: PagedStatusItemRequest): Promise<[Status[], boolean]> {
    await this.authService.authorize(request.authToken as any);

    const targetAlias = request.targetUserAlias || '';

    return this.statusDao.getStoryItems(
      targetAlias,
      request.pageSize,
      request.lastItemTimestamp || null,
    );
  }

  public async postStatus(auth: AuthToken | string | null, post: string): Promise<boolean> {
    const authorAlias = await this.authService.authorize(auth);
    const timestamp = Date.now();
    return this.statusDao.postStatus(authorAlias, post, timestamp);
  }
}
