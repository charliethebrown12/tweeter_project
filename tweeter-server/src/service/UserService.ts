import { FakeData, User } from 'tweeter-shared';

export class UserService {
  public async getUser(alias: string): Promise<User | null> {
    return FakeData.instance.findUserByAlias(alias);
  }
}
