import { User } from 'tweeter-shared';

export interface IUserDao {
  getUserByAlias(alias: string): Promise<User | null>;
  createUser(user: User, passwordHash: string): Promise<boolean>;
  getFirstUser(): Promise<User | null>;
}
