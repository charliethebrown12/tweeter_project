import { LoginPresenter } from '../../src/presenter/LoginPresenter';
import { PostStatusPresenter } from '../../src/presenter/PostStatusPresenter';
import { StoryPresenter } from '../../src/presenter/StoryPresenter';
import { AuthToken, Status, User } from 'tweeter-shared';

// This test assumes the backend is deployed and reachable via Service layer configuration.
// It logs in a known user, posts a status, and verifies the story contains it.

describe('Post Status Integration', () => {
  const username = 'CB'; // adjust alias if needed
  const password = 'password'; // adjust to a valid credential in your Users table
  const text = `Integration test status ${Date.now()}`;

  let authToken: AuthToken | null = null;
  let currentUser: User | null = null;

  it('logs in, posts status, and verifies story append', async () => {
    const loginPresenter = new LoginPresenter({
      setAuthToken: (t) => (authToken = t),
      setUser: (u) => (currentUser = u),
      displayErrorMessage: (m) => {
        throw new Error(`Login error: ${m}`);
      },
    } as any);

  // Set alias/password on presenter state and call login
  (loginPresenter as any).state = { alias: username, password };
  await loginPresenter.login();
    expect(authToken).toBeTruthy();
    expect(currentUser).toBeTruthy();

    const postPresenter = new PostStatusPresenter({
      displayErrorMessage: (m) => {
        throw new Error(`Post error: ${m}`);
      },
      displayInfoMessage: (m: string) => {
        // Expect status posted message eventually
        // We won't assert here; we'll verify via story fetch
      },
      deleteMessage: (_id: number) => {},
      clearLastMessage: () => {},
      clearPost: () => {},
    } as any);
    const status = new Status(text, currentUser!, Date.now());
    await postPresenter.postStatus(authToken!, status);

    // Fetch story and verify the new status exists at head
    const storyPresenter = new StoryPresenter({
      addStatuses: (_statuses, _hasMore) => {},
      clearStatuses: () => {},
      displayErrorMessage: (m) => {
        throw new Error(`Story error: ${m}`);
      },
      getDisplayedUser: () => currentUser!,
      getAuthToken: () => authToken,
    } as any);

  const [statuses] = await (storyPresenter as any).service.loadMoreStoryItems(authToken!, currentUser!.alias, 10, null);
    const found = statuses.find((s: any) => s.post === text);
    expect(found).toBeTruthy();
    expect(found.user.alias).toBe(currentUser!.alias.startsWith('@') ? currentUser!.alias : `@${currentUser!.alias}`);
  });
});
