import { Status, FakeData } from 'tweeter-shared';

export class StatusService {
  public async getPageOfStatuses(
    lastItem: Status | null,
    pageSize: number,
  ): Promise<[Status[], boolean]> {
    // TODO: Replace with the result of calling server
    return FakeData.instance.getPageOfStatuses(lastItem, pageSize);
  }
}
