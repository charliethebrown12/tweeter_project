import { User, FakeData, AuthToken } from 'tweeter-shared';
import { Service } from './Service';
import { ServerFacade } from 'src/net/ServerFacade';

export class UserService implements Service {
  private serverFacade = new ServerFacade();
  public async getUser(_authToken: AuthToken, alias: string): Promise<User | null> {
    return this.serverFacade.getUser(alias);
  }

  public async login(_alias: string, _password: string): Promise<[User, AuthToken]> {
    const { authToken, alias } = await this.serverFacade.login(_alias, _password);
    const user = await this.getUser({ token: authToken } as AuthToken, alias);
    if (!user) throw new Error('Invalid alias or password');
    return [user, { token: authToken } as AuthToken];
  }

  public async register(
    _firstName: string,
    _lastName: string,
    _alias: string,
    _password: string,
    _userImageBytes: Uint8Array,
    _imageFileExtension: string,
  ): Promise<[User, AuthToken]> {
    const imageUrl = 'https://faculty.cs.byu.edu/~jwilkerson/cs340/tweeter/images/donald_duck.png';
    const { authToken, alias } = await this.serverFacade.register(
      _firstName,
      _lastName,
      _alias,
      _password,
      imageUrl,
    );
    const user = await this.getUser({ token: authToken } as AuthToken, alias);
    if (!user) throw new Error('Invalid registration');
    return [user, { token: authToken } as AuthToken];
  }

  public async logout(_authToken: AuthToken | null): Promise<void> {
    if (_authToken?.token) {
      await this.serverFacade.logout(_authToken.token);
    }
  }
}
