import { Status } from 'tweeter-shared';
import { StatusService } from '../model.service/StatusService';
import { PageItemPresenter } from './PageItemPresenter';

export abstract class StatusItemPresenter extends PageItemPresenter<Status, StatusService> {
  protected serviceFactory(): StatusService {
    return new StatusService();
  }
}
