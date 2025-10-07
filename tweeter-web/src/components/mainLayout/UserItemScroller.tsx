import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import { User, AuthToken} from 'tweeter-shared';
import UserItem from '../userItem/UserItem';
import { useMessageActions } from '../toaster/MessageHooks';
import { useUserInfo, useUserInfoActions } from '../userInfo/UserHooks';
import { FolloweePresenter } from 'src/presenter/FolloweePresenter';
import UserItemPresenter, { UserItemView } from 'src/presenter/UserItemPresenter';

interface Props {
  featurePath: string; // e.g., "/followers" or "/followees"
  type: 'followers' | 'followees';
  loadMoreFunction: (
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastUser: User | null,
  ) => Promise<[User[], boolean]>;
  presenterFactory: (listener: UserItemView) => UserItemPresenter;
}

const UserItemScroller = (props: Props) => {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<User[]>([]);

  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: UserItemView = {
      addItems: (items: User[]) => setItems((previousItems) => [...previousItems, ...items]),
      displayErrorMessage: displayErrorMessage
  }

  const presenter = props.presenterFactory(listener);

  // Update the displayed user context variable whenever the displayedUser url parameter changes. This allows browser forward and back buttons to work correctly.
  useEffect(() => {
    if (authToken && displayedUserAliasParam && displayedUserAliasParam != displayedUser!.alias) {
      getUser(authToken!, displayedUserAliasParam!).then((toUser) => {
        if (toUser) {
          setDisplayedUser(toUser);
        }
      });
    }
  }, [displayedUserAliasParam]);

  // Initialize the component whenever the displayed user changes
  useEffect(() => {
    reset();
    loadMoreItems(null);
  }, [displayedUser]);

  const reset = async () => {
    setItems(() => []);
    presenter.reset();
  };

  const loadMoreItems = async (lastItem: User | null) => {
    presenter.loadMoreItems(authToken!, displayedUser!.alias);
  };

  const getUser = async (authToken: AuthToken, alias: string): Promise<User | null> => {
    return presenter.getUser(authToken, alias);
  }

  return (
    <div className="container px-0 overflow-visible vh-100">
      <InfiniteScroll
        className="pr-0 mr-0"
        dataLength={items.length}
        next={() => loadMoreItems(lastItem)}
        hasMore={hasMoreItems}
        loader={<h4>Loading...</h4>}
      >
        {items.map((item, index) => (
          <div key={index} className="row mb-3 mx-0 px-0 border rounded bg-white">
            <UserItem user={item} featurePath={props.featurePath} />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default UserItemScroller;
