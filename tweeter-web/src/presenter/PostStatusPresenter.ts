import { AuthToken, Status } from 'tweeter-shared';
import { StatusService } from 'src/model.service/StatusService';
import { Presenter, MessageView } from './Presenter';

export interface PostStatusView extends MessageView {
  // No additional methods needed, all are inherited from MessageView
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
  private service: StatusService;

  constructor(view: PostStatusView) {
    super(view);
    this.service = new StatusService();
  }

  public async postStatus(authToken: AuthToken, newStatus: Status) {
    this.doFailureReportingOperation(async () => {
      const toastId = this.view.displayInfoMessage('Posting status...', 0);
      await this.service.postStatus(authToken, newStatus);
      this.view.displayInfoMessage('Status posted!', 2000);
      this.view.deleteMessage(toastId);
    }, 'post status');
  }
}
