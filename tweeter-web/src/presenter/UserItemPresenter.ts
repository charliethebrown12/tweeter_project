import { User } from 'tweeter-shared/src/model/domain/User';
import { PageItemPresenter } from './PageItemPresenter';
import { FollowService } from 'src/model.service/FollowService';

export abstract class UserItemPresenter extends PageItemPresenter<User, FollowService> {
  protected serviceFactory(): FollowService {
    return new FollowService();
  }
}
