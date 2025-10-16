import { AuthToken, User } from 'tweeter-shared';
import { FollowService } from 'src/model.service/FollowService';
import { MessageView, Presenter } from './Presenter';

export interface UserInfoView extends MessageView {
  setIsFollower: (isFollower: boolean) => void;
  setFolloweeCount: (count: number) => void;
  setFollowerCount: (count: number) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
  private service: FollowService;

  constructor(view: UserInfoView) {
    super(view);
    this.service = new FollowService();
  }

  public async refresh(authToken: AuthToken, currentUser: User, displayedUser: User) {
    this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);

      if (currentUser === displayedUser) {
        this.view.setIsFollower(false);
      } else {
        const isFollower = await this.service.isFollower(authToken, currentUser, displayedUser);
        this.view.setIsFollower(isFollower);
      }

      const followeeCount = await this.service.getFolloweeCount(authToken, displayedUser);
      this.view.setFolloweeCount(followeeCount);

      const followerCount = await this.service.getFollowerCount(authToken, displayedUser);
      this.view.setFollowerCount(followerCount);
      this.view.setIsLoading(false);
    }, 'refresh user info');
  }

  public async follow(authToken: AuthToken, userToFollow: User) {
    await this.performFollowUnfollow(
      () => this.service.follow(authToken, userToFollow),
      `Following ${userToFollow.name}...`,
      true
    );
  }

  public async unfollow(authToken: AuthToken, userToUnfollow: User) {
    await this.performFollowUnfollow(
      () => this.service.unfollow(authToken, userToUnfollow),
      `Unfollowing ${userToUnfollow.name}...`,
      false
    );
  }

  private async performFollowUnfollow(
    operation: () => Promise<[number, number]>,
    message: string,
    isFollower: boolean
  ) {
    let toastId = '';
    try {
      this.view.setIsLoading(true);
      toastId = this.view.displayInfoMessage(message, 0);

      const [followerCount, followeeCount] = await operation();
      this.view.setIsFollower(isFollower);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    } catch (error) {
      this.view.displayErrorMessage(`Failed to ${isFollower ? 'follow' : 'unfollow'} user because of exception: ${error}`);
      throw error;
    } finally {
      if (toastId) this.view.deleteMessage(toastId);
      this.view.setIsLoading(false);
    }
  }
}
