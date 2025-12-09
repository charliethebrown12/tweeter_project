import { Status } from 'tweeter-shared';

export interface IStatusDao {
  getFeedItems(targetUserAlias: string | null, pageSize: number, lastTimestamp?: number | null): Promise<[Status[], boolean]>;
  getStoryItems(targetUserAlias: string, pageSize: number, lastTimestamp?: number | null): Promise<[Status[], boolean]>;
  postStatus(authorAlias: string, post: string, timestamp: number): Promise<boolean>;
  batchWriteFeedItems(items: {
    userAlias: string;
    timestamp: number;
    post: string;
    authorAlias: string;
    authorFirstName: string;
    authorLastName: string;
    authorImageUrl: string;
  }[]): Promise<void>;
}
