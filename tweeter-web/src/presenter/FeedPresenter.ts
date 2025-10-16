import { AuthToken, Status } from 'tweeter-shared';
import { StatusItemPresenter } from './StatusItemPresenter';
import { PAGE_SIZE } from './PageItemPresenter';

export class FeedPresenter extends StatusItemPresenter {
  protected itemDescription(): string {
    return 'load feed';
  }
  protected getMoreItems(authToken: AuthToken, userAlias: string): Promise<[Status[], boolean]> {
    return this.service.loadMoreFeedItems(authToken, userAlias, PAGE_SIZE, this.lastItem);
  }
}
