import { User, FakeData, AuthToken } from 'tweeter-shared';

export class AuthService {
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
}
