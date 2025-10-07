import { User } from "tweeter-shared/src/model/domain/User";

export interface UserItemView {
    addItems(items: User[]): void;
    displayErrorMessage(message: string): void;
}

export abstract class UserItemPresenter {
    private _view: UserItemView;
    private _hasMoreItems = true;
    private _lastItem: User | null = null;

    protected constructor (view: UserItemView) {
        this._view = view;
    }

    protected get view() {
      return this._view;
    }

    protected get hasMoreItems() {
      return this._hasMoreItems;
    }

    protected get lastItem() {
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

    public abstract loadMoreItems(authToken: string, userAlias: string): void;


}
