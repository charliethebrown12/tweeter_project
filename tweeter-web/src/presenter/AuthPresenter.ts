import { AuthToken, User } from 'tweeter-shared';
import { AuthService } from 'src/model.service/AuthService';

export interface AuthView {
  onAuthSuccess: (user: User, authToken: AuthToken, remember: boolean, redirect?: string) => void;
  displayErrorMessage: (message: string) => void;
}

export class AuthPresenter {
  private view: AuthView;
  private service: AuthService;

  constructor(view: AuthView) {
    this.view = view;
    this.service = new AuthService();
  }

  public async login(alias: string, password: string, remember: boolean, originalUrl?: string) {
    try {
      const [user, authToken] = await this.service.login(alias, password);
      this.view.onAuthSuccess(user, authToken, remember, originalUrl);
    } catch (error) {
      this.view.displayErrorMessage(`Failed to log user in because of exception: ${error}`);
      throw error;
    }
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string,
    remember: boolean,
  ) {
    try {
      const [user, authToken] = await this.service.register(
        firstName,
        lastName,
        alias,
        password,
        userImageBytes,
        imageFileExtension,
      );
      this.view.onAuthSuccess(user, authToken, remember, `/feed/${user.alias}`);
    } catch (error) {
      this.view.displayErrorMessage(`Failed to register user because of exception: ${error}`);
      throw error;
    }
  }
}
