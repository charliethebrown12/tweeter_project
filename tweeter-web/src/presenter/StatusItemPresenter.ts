import { Status, User } from 'tweeter-shared';
import { AuthToken } from 'tweeter-shared';
import { StatusService } from '../model.service/StatusService';
import { UserService } from 'src/model.service/UserService';

export interface StatusItemView {
  addItems(items: Status[]): void;
  displayErrorMessage(message: string): void;
}

export abstract class StatusItemPresenter {
  private _view: StatusItemView;
  private _hasMoreItems = true;
  private _lastItem: Status | null = null;
  private statusService: StatusService;
  private userService: UserService = new UserService();

  protected constructor(view: StatusItemView) {
    this._view = view;
    this.statusService = new StatusService();
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

  protected set lastItem(value: Status | null) {
    this._lastItem = value;
  }

  reset() {
    this._lastItem = null;
    this._hasMoreItems = true;
  }

  public abstract loadMoreItems(_authToken: AuthToken, _userAlias: string, pageSize: number): void;

  protected async getPageOfStatuses(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<[Status[], boolean]> {
    return this.statusService.getPageOfStatuses(lastItem, pageSize);
  }

  public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }
}
