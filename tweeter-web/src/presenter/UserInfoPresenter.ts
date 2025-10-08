import { AuthToken, User } from 'tweeter-shared';
import { UserInfoService } from 'src/model.service/UserInfoService';

export interface UserInfoView {
  setIsFollower: (isFollower: boolean) => void;
  setFolloweeCount: (count: number) => void;
  setFollowerCount: (count: number) => void;
  displayErrorMessage: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  displayInfoMessage: (message: string, duration: number, bootstrapClasses?: string) => string;
  deleteMessage: (messageId: string) => void;
}

export class UserInfoPresenter {
  private view: UserInfoView;
  private service: UserInfoService;

  constructor(view: UserInfoView) {
    this.view = view;
    this.service = new UserInfoService();
  }

  public async refresh(authToken: AuthToken, currentUser: User, displayedUser: User) {
    try {
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
    } catch (error) {
      this.view.displayErrorMessage(`Failed to refresh user info because of exception: ${error}`);
    } finally {
      this.view.setIsLoading(false);
    }
  }

  public async follow(authToken: AuthToken, userToFollow: User) {
    let toastId = '';
    try {
      this.view.setIsLoading(true);
      toastId = this.view.displayInfoMessage(`Following ${userToFollow.name}...`, 0);

      const [followerCount, followeeCount] = await this.service.follow(authToken, userToFollow);
      this.view.setIsFollower(true);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    } catch (error) {
      this.view.displayErrorMessage(`Failed to follow user because of exception: ${error}`);
      throw error;
    } finally {
      if (toastId) this.view.deleteMessage(toastId);
      this.view.setIsLoading(false);
    }
  }

  public async unfollow(authToken: AuthToken, userToUnfollow: User) {
    let toastId = '';
    try {
      this.view.setIsLoading(true);
      toastId = this.view.displayInfoMessage(`Unfollowing ${userToUnfollow.name}...`, 0);

      const [followerCount, followeeCount] = await this.service.unfollow(authToken, userToUnfollow);
      this.view.setIsFollower(false);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    } catch (error) {
      this.view.displayErrorMessage(`Failed to unfollow user because of exception: ${error}`);
      throw error;
    } finally {
      if (toastId) this.view.deleteMessage(toastId);
      this.view.setIsLoading(false);
    }
  }
}
