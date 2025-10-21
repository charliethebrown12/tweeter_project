import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { AuthToken, User } from "tweeter-shared";
import { instance, mock, verify, anything } from "@typestrong/ts-mockito";
import PostStatus from "../../../src/components/postStatus/PostStatus";
import { useUserInfo } from "../../../src/components/userInfo/UserHooks";
import { PostStatusPresenter } from "../../../src/presenter/PostStatusPresenter";

jest.mock("../../../src/components/userInfo/UserHooks", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserHooks"),
  __esModule: true,
  useUserInfo: jest.fn(),
}));

describe("PostStatus Component", () => {
  const mockUserInstance = new User("first", "last", "alias", "image");
  const mockAuthTokenInstance = new AuthToken("token", 123);

  beforeAll(() => {
    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: mockUserInstance,
      authToken: mockAuthTokenInstance,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with the Post Status and Clear buttons disabled", () => {
    renderPostStatus();

    const postStatusButton = screen.getByRole("button", { name: /Post Status/i });
    const clearButton = screen.getByRole("button", { name: /Clear/i });

    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("enables the Post Status and Clear buttons when the text field has text", async () => {
    const { user, textArea, postStatusButton, clearButton } = renderPostStatusAndGetElements();

    await user.type(textArea, "some text");

    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  it("disables the Post Status and Clear buttons when the text field is cleared", async () => {
    const { user, textArea, postStatusButton, clearButton } = renderPostStatusAndGetElements();

    await user.type(textArea, "some text");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();

    await user.clear(textArea);
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("calls the presenter's postStatus method with correct parameters when the Post Status button is pressed", async () => {
    const mockPresenter = mock<PostStatusPresenter>();
    const mockPresenterInstance =  instance(mockPresenter);
    const { user, textArea, postStatusButton } = renderPostStatusAndGetElements(mockPresenterInstance);

    await user.type(textArea, "test post");
    await user.click(postStatusButton);

    verify(mockPresenter.postStatus(mockAuthTokenInstance, anything())).once();
  });
});

function renderPostStatus(presenter?: PostStatusPresenter) {
  return render(<PostStatus presenter={presenter} />);
}

function renderPostStatusAndGetElements(presenter?: PostStatusPresenter) {
  const user = userEvent.setup();
  renderPostStatus(presenter);
  const textArea = screen.getByPlaceholderText("What's on your mind?");
  const postStatusButton = screen.getByRole("button", { name: /Post Status/i });
  const clearButton = screen.getByRole("button", { name: /Clear/i });
  return { user, textArea, postStatusButton, clearButton };
}
