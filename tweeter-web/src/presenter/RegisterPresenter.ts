import { AuthPresenter } from './AuthPresenter';

export class RegisterPresenter extends AuthPresenter {
  public async register() {
    await this.authenticate(
      () => this.service.register(
        this.state.firstName,
        this.state.lastName,
        this.state.alias,
        this.state.password,
        this.state.imageBytes,
        this.state.imageFileExtension
      ),
      'register'
    );
  }
}
