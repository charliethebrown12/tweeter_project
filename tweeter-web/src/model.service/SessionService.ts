import { AuthToken } from 'tweeter-shared';

export class SessionService {
  public async logout(_authToken: AuthToken | null): Promise<void> {
    // TODO: Call backend to invalidate session. Simulate delay for now.
    await new Promise((r) => setTimeout(r, 500));
  }
}
