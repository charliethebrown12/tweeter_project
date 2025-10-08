import { AuthToken } from 'tweeter-shared';
import { StatusItemPresenter, StatusItemView } from './StatusItemPresenter';

const PAGE_SIZE = 10;

export class StoryPresenter extends StatusItemPresenter {
  constructor(view: StatusItemView) {
    super(view);
  }

  public async loadMoreItems(authToken: AuthToken, userAlias: string, pageSize = PAGE_SIZE) {
    try {
      const [newItems, hasMore] = await this.getPageOfStatuses(
        authToken,
        userAlias,
        pageSize,
        this.lastItem,
      );

      this.hasMoreItems = hasMore;
      this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null;
      this.view.addItems(newItems);
    } catch (error) {
      this.view.displayErrorMessage(`Failed to load story items because of exception: ${error}`);
    }
  }
}
