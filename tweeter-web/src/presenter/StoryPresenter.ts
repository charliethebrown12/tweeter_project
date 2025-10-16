import { AuthToken, Status } from 'tweeter-shared';
import { StatusItemPresenter } from './StatusItemPresenter';
import { PAGE_SIZE } from './PageItemPresenter';

export class StoryPresenter extends StatusItemPresenter {
  protected itemDescription(): string {
    return 'load story';
  }
  protected getMoreItems(authToken: AuthToken, userAlias: string): Promise<[Status[], boolean]> {
    return this.service.loadMoreStoryItems(authToken, userAlias, PAGE_SIZE, this.lastItem);
  }
}
