import { AuthToken } from 'tweeter-shared';
import { SessionService } from 'src/model.service/SessionService';

export interface SessionView {
  displayInfoMessage: (message: string, duration: number, bootstrapClasses?: string) => string;
  deleteMessage: (messageId: string) => void;
  displayErrorMessage: (message: string, bootstrapClasses?: string) => string;
  onLogoutSuccess: () => void;
}

export class SessionPresenter {
  private view: SessionView;
  private service: SessionService;

  constructor(view: SessionView) {
    this.view = view;
    this.service = new SessionService();
  }

  public async logout(authToken: AuthToken | null) {
    const toastId = this.view.displayInfoMessage('Logging Out...', 0);
    try {
      await this.service.logout(authToken);
      this.view.deleteMessage(toastId);
      this.view.onLogoutSuccess();
    } catch (error) {
      this.view.deleteMessage(toastId);
      this.view.displayErrorMessage(`Failed to log user out because of exception: ${error}`);
      throw error;
    }
  }
}
