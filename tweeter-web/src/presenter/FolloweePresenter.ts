import { AuthToken, User, FakeData } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { UserService } from "src/model.service/UserService";
import UserItemPresenter, { UserItemView } from "./UserItemPresenter";

const PAGE_SIZE = 10;


export class FolloweePresenter extends UserItemPresenter {
    private service: FollowService;
    private userService: UserService;

    constructor(view: UserItemView) {
        super(view);
        this.service = new FollowService();
        this.userService = new UserService();
    }

      public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
        return this.userService.getUser(authToken, alias);
      };

    public async loadMoreItems(authToken: AuthToken, userAlias: string) {
        try {
        const [newItems, hasMore] = await this.service.loadMoreFollowees(
            authToken!,
            userAlias,
            PAGE_SIZE,
            this.lastItem,
        );
    
        this.hasMoreItems = hasMore;
        this.lastItem = newItems[newItems.length - 1];
        this.view.addItems(newItems);
        } catch (error) {
        this.view.displayErrorMessage(`Failed to load followees because of exception: ${error}`);
        }
    };
}