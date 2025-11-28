import { IAuthDao } from '../interfaces/IAuthDao';
import { FakeData, AuthToken } from 'tweeter-shared';

export class InMemoryAuthDao implements IAuthDao {
  public async validateToken(token: string): Promise<boolean> {
    return FakeData.instance.authToken.token === token;
  }
  public async createSession(alias: string): Promise<AuthToken> {
    return FakeData.instance.authToken;
  }
  public async deleteSession(token: string): Promise<void> {
    return;
  }
  public async getPasswordHashForUser(alias: string): Promise<string | null> {
    // FakeData doesn't store password hashes in M3; return null
    return null;
  }
  public async setPasswordHashForUser(alias: string, hash: string): Promise<void> {
    return;
  }
  public async getAliasForToken(token: string): Promise<string | null> {
    if (FakeData.instance.authToken.token === token) {
      const user = FakeData.instance.firstUser;
      return user ? user.alias : null;
    }
    return null;
  }
}
