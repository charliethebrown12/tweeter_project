import { User } from 'tweeter-shared';
import { IDaoFactory } from '../dao/interfaces/IDaoFactory';

export class UserService {
  private userDao;
  constructor(private factory: IDaoFactory) {
    this.userDao = this.factory.createUserDao();
  }

  public async getUser(alias: string): Promise<User | null> {
    return this.userDao.getUserByAlias(alias);
  }
}
