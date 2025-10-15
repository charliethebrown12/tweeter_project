import { AuthToken } from 'tweeter-shared';
import { UserService } from 'src/model.service/UserService';
import { Presenter, MessageView } from './Presenter';

export interface NavbarView extends MessageView {
  onLogoutSuccess: () => void;
}

export class NavbarPresenter extends Presenter<NavbarView> {
  private service: UserService;

  constructor(view: NavbarView) {
    super(view);
    this.service = new UserService();
  }

  public async logout(authToken: AuthToken | null) {
    this.doFailureReportingOperation(async () => {
      const toastId = this.view.displayInfoMessage('Logging Out...', 0);
      await this.service.logout(authToken);
      this.view.deleteMessage(toastId);
      this.view.onLogoutSuccess();
    }, 'logout');
  }
}