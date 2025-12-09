import './PostStatus.css';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Status } from 'tweeter-shared';
import { useMessageActions } from '../toaster/MessageHooks';
import { useUserInfo } from '../userInfo/UserHooks';
import { PostStatusPresenter, PostStatusView } from 'src/presenter/PostStatusPresenter';

const PostStatus = (props?: { presenter?: PostStatusPresenter }) => {
  const { displayErrorMessage } = useMessageActions();
  const navigate = useNavigate();

  const { currentUser, authToken } = useUserInfo();
  const [post, setPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const viewRef = useRef<PostStatusView>({
    displayInfoMessage: () => '',
    deleteMessage: () => {},
    displayErrorMessage: (message: string, bootstrapClasses?: string) =>
      displayErrorMessage(message, bootstrapClasses),
    clearPost: () => setPost(''),
  });

  const presenterRef = useRef<PostStatusPresenter | null>(null);
  if (!presenterRef.current)
    presenterRef.current = props?.presenter || new PostStatusPresenter(viewRef.current);

  const submitPost = async (event: React.MouseEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true);

      const status = new Status(post, currentUser!, Date.now());

      await presenterRef.current!.postStatus(authToken!, status);

      setPost('');
      // After successful post, take the user to their story so they can see it immediately
      navigate(`/story/${currentUser!.alias}`);
    } catch (error) {
      displayErrorMessage(`Failed to post the status because of exception: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // posting logic handled by presenter

  const clearPost = (event: React.MouseEvent) => {
    event.preventDefault();
    setPost('');
  };

  const checkButtonStatus: () => boolean = () => {
    return !post.trim() || !authToken || !currentUser;
  };

  return (
    <form>
      <div className="form-group mb-3">
        <textarea
          className="form-control"
          id="postStatusTextArea"
          rows={10}
          placeholder="What's on your mind?"
          value={post}
          onChange={(event) => {
            setPost(event.target.value);
          }}
        />
      </div>
      <div className="form-group">
        <button
          id="postStatusButton"
          className="btn btn-md btn-primary me-1"
          type="button"
          disabled={checkButtonStatus()}
          style={{ width: '8em' }}
          onClick={submitPost}
        >
          {isLoading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <div>Post Status</div>
          )}
        </button>
        <button
          id="clearStatusButton"
          className="btn btn-md btn-secondary"
          type="button"
          disabled={checkButtonStatus()}
          onClick={clearPost}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default PostStatus;
