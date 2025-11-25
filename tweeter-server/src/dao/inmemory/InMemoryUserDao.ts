import { IUserDao } from '../interfaces/IUserDao';
import { User, FakeData } from 'tweeter-shared';

export class InMemoryUserDao implements IUserDao {
  public async getUserByAlias(alias: string): Promise<User | null> {
    return FakeData.instance.findUserByAlias(alias);
  }

  public async createUser(user: User, passwordHash: string): Promise<boolean> {
    // FakeData doesn't persist new users; for M4 Part A we just return true
    return true;
  }
  public async getFirstUser(): Promise<User | null> {
    return FakeData.instance.firstUser;
  }
}
