import '@testing-library/jest-dom';
import { ServerFacade } from '../../src/net/ServerFacade';
import { PostStatusPresenter } from '../../src/presenter/PostStatusPresenter';
import { AuthToken, Status, User } from 'tweeter-shared';

// This test assumes a real API URL (VITE_API_URL) and an existing user with known credentials.
// To run locally, set VITE_API_URL and provide alias/password via env vars or inline below.

describe('Post status integration', () => {
  const facade = new ServerFacade();
  const alias = process.env.TEST_ALIAS || '@alice';
  const password = process.env.TEST_PASSWORD || 'pass1234';

  it('posts a status and appears in story', async () => {
    const login = await facade.login(alias, password);
    const auth = new AuthToken(login.authToken, Date.now());

    // Prepare a fake view to capture success toast
    let showedSuccess = false;
    const view = {
      displayInfoMessage: (msg) => {
        if (msg.toLowerCase().includes('status posted')) showedSuccess = true;
        return '';
      },
      deleteMessage: () => {},
      displayErrorMessage: (_msg) => {},
      clearPost: () => {},
    };

    const presenter = new PostStatusPresenter(view);
    const user = new User('First', 'Last', alias, '');
    const unique = `Integration test ${Date.now()}`;
    const status = new Status(unique, user, Date.now());

    await presenter.postStatus(auth, status);
    expect(showedSuccess).toBe(true);

    const [items] = await facade.getMoreStory({
      targetUserAlias: alias,
      pageSize: 10,
      lastItemTimestamp: null,
      authToken: auth.token,
    } as any);

    expect(items.some((s) => s.post === unique && s.user.alias === alias)).toBe(true);
  }, 20000);
});
