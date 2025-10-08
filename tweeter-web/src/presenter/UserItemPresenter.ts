import { UserService } from 'src/model.service/UserService';
import { AuthToken } from 'tweeter-shared';
import { User } from 'tweeter-shared/src/model/domain/User';

export interface UserItemView {
  addItems(items: User[]): void;
  displayErrorMessage(message: string): void;
}

export abstract class UserItemPresenter {
  private _view: UserItemView;
  private _hasMoreItems = true;
  private _lastItem: User | null = null;
  private userService: UserService;

  protected constructor(view: UserItemView) {
    this._view = view;
    this.userService = new UserService();
  }

  protected get view() {
    return this._view;
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

  protected set lastItem(value: User | null) {
    this._lastItem = value;
  }

  reset() {
    this._lastItem = null;
    this._hasMoreItems = true;
  }

  public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;

  public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }
}
