import { AuthPresenter } from './AuthPresenter';

export class LoginPresenter extends AuthPresenter {
  public async login(originalUrl?: string) {
    await this.authenticate(
      () => this.service.login(this.state.alias, this.state.password),
      'login',
      originalUrl
    );
  }
}
