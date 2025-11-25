import { AuthToken } from 'tweeter-shared';

export interface IAuthDao {
  validateToken(token: string): Promise<boolean>;
  createSession(alias: string): Promise<AuthToken>;
  deleteSession(token: string): Promise<void>;
  getPasswordHashForUser(alias: string): Promise<string | null>;
  setPasswordHashForUser(alias: string, hash: string): Promise<void>;
}
