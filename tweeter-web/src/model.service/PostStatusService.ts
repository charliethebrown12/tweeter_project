import { AuthToken, Status } from 'tweeter-shared';

export class PostStatusService {
  public async postStatus(_authToken: AuthToken, _newStatus: Status): Promise<void> {
    // TODO: Replace with server call to post status
    // Simulate delay
    await new Promise((r) => setTimeout(r, 500));
  }
}
