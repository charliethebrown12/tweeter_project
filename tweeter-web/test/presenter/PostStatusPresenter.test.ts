import { PostStatusPresenter, PostStatusView } from '../../src/presenter/PostStatusPresenter';
import { StatusService } from '../../src/model.service/StatusService';
import { AuthToken, Status, User } from 'tweeter-shared';
import { anything, instance, mock, spy, verify, when } from '@typestrong/ts-mockito';

describe('PostStatusPresenter', () => {
  let mockPostStatusView: PostStatusView;
  let presenter: PostStatusPresenter;
  let mockStatusService: StatusService;
  let authToken: AuthToken;
  let status: Status;

  const genericErrorMessage = 'Failed to post status';
  const successMessage = 'Status posted!';
  const postingMessage = 'Posting status...';

  beforeEach(() => {
    mockPostStatusView = mock<PostStatusView>();
    const mockViewInstance = instance(mockPostStatusView);

    const presenterSpy = spy(new PostStatusPresenter(mockViewInstance));
    presenter = instance(presenterSpy);

    mockStatusService = mock<StatusService>();

    when(presenterSpy.service).thenReturn(instance(mockStatusService));

    const mockUser = mock<User>();
    authToken = new AuthToken('test-token', Date.now());
    status = new Status('test post', instance(mockUser), Date.now());

    when(mockPostStatusView.displayInfoMessage(anything(), anything())).thenReturn('mock-toast-id');
  });

  it('tells the view to display a posting status message', async () => {
    when(mockStatusService.postStatus(authToken, status)).thenResolve();

    await presenter.postStatus(authToken, status);

    verify(mockPostStatusView.displayInfoMessage(postingMessage, 0)).once();
  });

  it('calls postStatus on the service with the correct status and auth token', async () => {
    when(mockStatusService.postStatus(authToken, status)).thenResolve();

    await presenter.postStatus(authToken, status);

    verify(mockStatusService.postStatus(authToken, status)).once();
  });

  it('on success, clears the previous message, clears the post, and shows a success message', async () => {
    when(mockStatusService.postStatus(authToken, status)).thenResolve();

    await presenter.postStatus(authToken, status);

    verify(mockPostStatusView.deleteMessage('mock-toast-id')).once();
    verify(mockPostStatusView.clearPost()).once();
    verify(mockPostStatusView.displayInfoMessage(successMessage, 2000)).once();
    verify(mockPostStatusView.displayErrorMessage(anything())).never();
  });

  it('on failure, displays an error message and does not clear the previous message or the post', async () => {
    let error = new Error('An error occurred');
    when(mockStatusService.postStatus(authToken, status)).thenThrow(error);

    await presenter.postStatus(authToken, status);

    verify(mockPostStatusView.displayErrorMessage(`Failed to post status because of exception: An error occurred`)).once();
    verify(mockPostStatusView.deleteMessage('mock-toast-id')).never();
    verify(mockPostStatusView.clearPost()).never();
    verify(mockPostStatusView.displayInfoMessage(successMessage, 2000)).never();
  });
});