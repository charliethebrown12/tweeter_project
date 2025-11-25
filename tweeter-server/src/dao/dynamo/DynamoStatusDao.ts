import { IStatusDao } from '../interfaces/IStatusDao';
import { Status } from 'tweeter-shared';
export class DynamoStatusDao implements IStatusDao {
  public async getFeedItems(targetUserAlias: string | null, pageSize: number, lastTimestamp?: number | null): Promise<[Status[], boolean]> {
    return [[], false];
  }
  public async getStoryItems(targetUserAlias: string, pageSize: number, lastTimestamp?: number | null): Promise<[Status[], boolean]> {
    return [[], false];
  }
  public async postStatus(authorAlias: string, post: string, timestamp: number): Promise<boolean> {
    return false;
  }
}
