import { AuthToken, Status } from 'tweeter-shared';
import { StatusService } from 'src/model.service/StatusService';
import { Presenter, MessageView } from './Presenter';

export interface PostStatusView extends MessageView {
  clearPost: () => void;
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
  protected _service: StatusService;

  constructor(view: PostStatusView) {
    super(view);
    this._service = new StatusService();
  }

  public get service() {
    return this._service;
  }

  public async postStatus(authToken: AuthToken, newStatus: Status) {
    this.doFailureReportingOperation(async () => {
      const toastId = this.view.displayInfoMessage('Posting status...', 0);
      await this.service.postStatus(authToken, newStatus);
      this.view.deleteMessage(toastId);
      this.view.clearPost();
      this.view.displayInfoMessage('Status posted!', 2000);
    }, 'post status');
  }
}
