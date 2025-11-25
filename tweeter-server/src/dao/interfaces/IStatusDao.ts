import { Status } from 'tweeter-shared';

export interface IStatusDao {
  getFeedItems(targetUserAlias: string | null, pageSize: number, lastTimestamp?: number | null): Promise<[Status[], boolean]>;
  getStoryItems(targetUserAlias: string, pageSize: number, lastTimestamp?: number | null): Promise<[Status[], boolean]>;
  postStatus(authorAlias: string, post: string, timestamp: number): Promise<boolean>;
}
