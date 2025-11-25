import { IUserDao } from '../interfaces/IUserDao';
import { User } from 'tweeter-shared';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const TABLE = process.env.USERS_TABLE || 'TweeterUsers';

export class DynamoUserDao implements IUserDao {
  private client: DynamoDBDocumentClient;
  constructor() {
    const c = new DynamoDBClient({});
    this.client = DynamoDBDocumentClient.from(c);
  }

  public async getUserByAlias(alias: string): Promise<User | null> {
    const key = { alias };
    const cmd = new GetCommand({ TableName: TABLE, Key: key });
    const resp = (await this.client.send(cmd as any)) as any;
    if (!resp || !resp.Item) return null;
    const item = resp.Item as any;
    return new User(item.firstName, item.lastName, item.alias, item.imageUrl);
  }

  public async createUser(user: User, passwordHash: string): Promise<boolean> {
    const item = { alias: user.alias, firstName: user.firstName, lastName: user.lastName, imageUrl: user.imageUrl, passwordHash };
    const cmd = new PutCommand({ TableName: TABLE, Item: item, ConditionExpression: 'attribute_not_exists(alias)' });
    try {
      await this.client.send(cmd as any);
      return true;
    } catch (e) {
      // Likely conditional check failed or other error
      return false;
    }
  }

  public async getFirstUser(): Promise<User | null> {
    const cmd = new ScanCommand({ TableName: TABLE, Limit: 1 });
    const resp = (await this.client.send(cmd as any)) as any;
    if (!resp || !resp.Items || resp.Items.length === 0) return null;
    const item = resp.Items[0] as any;
    return new User(item.firstName, item.lastName, item.alias, item.imageUrl);
  }
}
