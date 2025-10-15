import { UserService } from "src/model.service/UserService";
import { User, AuthToken } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { Service } from "src/model.service/Service";

export const PAGE_SIZE = 10;

export interface PageItemView<T> extends View {
  addItems(items: T[]): void;

}

export abstract class PageItemPresenter<T, U extends Service> extends Presenter<PageItemView<T>> {
  private _hasMoreItems = true;
  private _lastItem: T | null = null;
  private _service: U;
  private userService: UserService = new UserService();

  public constructor(view: PageItemView<T>) {
    super(view);
    this._service = this.serviceFactory();
  }

  protected abstract serviceFactory(): U;

  protected get service() {
    return this._service;
  }

  public get hasMoreItems() {
    return this._hasMoreItems;
  }

  public get lastItem() {
    return this._lastItem;
  }

  protected set hasMoreItems(value: boolean) {
    this._hasMoreItems = value;
  }

  protected set lastItem(value: T | null) {
    this._lastItem = value;
  }

  reset() {
    this._lastItem = null;
    this._hasMoreItems = true;
  }

  public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }

    public async loadMoreItems(authToken: AuthToken, userAlias: string) {
      this.doFailureReportingOperation(async () => {
        const [newItems, hasMore] = await this.getMoreItems(
          authToken!,
          userAlias,
        );
  
        this.hasMoreItems = hasMore;
        this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null;
        this.view.addItems(newItems);
      }, this.itemDescription());
    }

  protected abstract itemDescription(): string;

    protected abstract getMoreItems(authToken: AuthToken, userAlias: string): Promise<[T[], boolean]>;
}