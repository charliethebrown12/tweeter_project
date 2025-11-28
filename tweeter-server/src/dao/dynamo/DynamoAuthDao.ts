import { IAuthDao } from '../interfaces/IAuthDao';
import { AuthToken } from 'tweeter-shared';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import * as bcrypt from 'bcryptjs';

const SESSIONS_TABLE = process.env.SESSIONS_TABLE || 'TweeterSessions';
const USERS_TABLE = process.env.USERS_TABLE || 'TweeterUsers';

export class DynamoAuthDao implements IAuthDao {
  private client: DynamoDBDocumentClient;
  private readonly SESSIONS_TABLE = process.env.SESSIONS_TABLE || 'TweeterSessions';
  constructor() {
    const c = new DynamoDBClient({});
    this.client = DynamoDBDocumentClient.from(c);
  }

  public async validateToken(token: string): Promise<boolean> {
    const cmd = new GetCommand({ TableName: SESSIONS_TABLE, Key: { token } });
    const resp = (await this.client.send(cmd as any)) as any;
    return !!(resp && resp.Item);
  }

  public async createSession(alias: string): Promise<AuthToken> {
    const tok = AuthToken.Generate();
    const cmd = new PutCommand({
      TableName: SESSIONS_TABLE,
      Item: { token: tok.token, alias, timestamp: tok.timestamp },
    });
    await this.client.send(cmd as any);
    return tok;
  }

  public async deleteSession(token: string): Promise<void> {
    const cmd = new DeleteCommand({ TableName: SESSIONS_TABLE, Key: { token } });
    await this.client.send(cmd as any);
  }

  public async getPasswordHashForUser(alias: string): Promise<string | null> {
    const cmd = new GetCommand({
      TableName: USERS_TABLE,
      Key: { alias },
      ProjectionExpression: 'passwordHash',
    });
    const resp = (await this.client.send(cmd as any)) as any;
    if (!resp || !resp.Item) return null;
    return resp.Item.passwordHash || null;
  }

  public async setPasswordHashForUser(alias: string, hash: string): Promise<void> {
    const cmd = new PutCommand({ TableName: USERS_TABLE, Item: { alias, passwordHash: hash } });
    await this.client.send(cmd as any);
  }

  public async getAliasForToken(token: string): Promise<string | null> {
    const result: any = await this.client.send(
      new GetCommand({
        TableName: this.SESSIONS_TABLE,
        Key: { token },
        ProjectionExpression: 'alias',
      }) as any,
    );

    if (!result || !result.Item) {
      return null;
    } else {
      return result.Item.alias as string;
    }
  }
}
