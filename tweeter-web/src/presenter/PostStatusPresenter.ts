import { AuthToken, Status } from 'tweeter-shared';
import { PostStatusService } from 'src/model.service/PostStatusService';

export interface PostStatusView {
  displayInfoMessage: (message: string, duration: number, bootstrapClasses?: string) => string;
  deleteMessage: (messageId: string) => void;
  displayErrorMessage: (message: string, bootstrapClasses?: string) => string;
}

export class PostStatusPresenter {
  private view: PostStatusView;
  private service: PostStatusService;

  constructor(view: PostStatusView) {
    this.view = view;
    this.service = new PostStatusService();
  }

  public async postStatus(authToken: AuthToken, newStatus: Status) {
    const toastId = this.view.displayInfoMessage('Posting status...', 0);
    try {
      await this.service.postStatus(authToken, newStatus);
      this.view.displayInfoMessage('Status posted!', 2000);
    } catch (error) {
      this.view.displayErrorMessage(`Failed to post the status because of exception: ${error}`);
      throw error;
    } finally {
      this.view.deleteMessage(toastId);
    }
  }
}
