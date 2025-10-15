import { User, FakeData, AuthToken } from 'tweeter-shared';
import { Service } from './Service';

export class UserService implements Service {
  public async getUser(_authToken: AuthToken, alias: string): Promise<User | null> {
    // TODO: Replace with the result of calling server
    return FakeData.instance.findUserByAlias(alias);
  }

  public async login(_alias: string, _password: string): Promise<[User, AuthToken]> {
    // TODO: Replace with the result of calling the server
    const user = FakeData.instance.firstUser;

    if (user === null) {
      throw new Error('Invalid alias or password');
    }

    return [user, FakeData.instance.authToken];
  }

  public async register(
    _firstName: string,
    _lastName: string,
    _alias: string,
    _password: string,
    _userImageBytes: Uint8Array,
    _imageFileExtension: string,
  ): Promise<[User, AuthToken]> {
    // TODO: Replace with the result of calling the server
    const user = FakeData.instance.firstUser;

    if (user === null) {
      throw new Error('Invalid registration');
    }

    return [user, FakeData.instance.authToken];
  }

  public async logout(_authToken: AuthToken | null): Promise<void> {
    // TODO: Call backend to invalidate session. Simulate delay for now.
    await new Promise((r) => setTimeout(r, 500));
  }
}
