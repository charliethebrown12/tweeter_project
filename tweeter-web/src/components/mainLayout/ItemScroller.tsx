import { useState, useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import { useMessageActions } from '../toaster/MessageHooks';
import { useUserInfo, useUserInfoActions } from '../userInfo/UserHooks';
import { PageItemPresenter, PageItemView } from 'src/presenter/PageItemPresenter';

interface Props<T> {
  featurePath: string;
  presenterFactory: (listener: PageItemView<T>) => PageItemPresenter<T, any>;
  itemRenderer: (item: T, index: number, featurePath: string) => JSX.Element;
}

const ItemScroller = <T,>(props: Props<T>) => {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<T[]>([]);

  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: PageItemView<T> = {
    addItems: (items: T[]) => setItems((previousItems) => [...previousItems, ...items]),
    displayErrorMessage: displayErrorMessage,
  };

  const presenterRef = useRef<PageItemPresenter<T, any> | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = props.presenterFactory(listener);
  }

  // Update the displayed user context variable whenever the displayedUser url parameter changes. This allows browser forward and back buttons to work correctly.
  useEffect(() => {
    if (authToken && displayedUserAliasParam && displayedUserAliasParam != displayedUser!.alias) {
      presenterRef.current!.getUser(authToken!, displayedUserAliasParam!).then((toUser) => {
        if (toUser) {
          setDisplayedUser(toUser);
        }
      });
    }
  }, [displayedUserAliasParam]);

  // Initialize the component whenever the displayed user changes
  useEffect(() => {
    reset();
    loadMoreItems();
  }, [displayedUser]);

  const reset = async () => {
    setItems(() => []);
    presenterRef.current!.reset();
  };

  const loadMoreItems = async () => {
    presenterRef.current!.loadMoreItems(authToken!, displayedUser!.alias);
  };

  return (
    <div className="container px-0 overflow-visible vh-100">
      <InfiniteScroll
        className="pr-0 mr-0"
        dataLength={items.length}
        next={loadMoreItems}
        hasMore={presenterRef.current!.hasMoreItems}
        loader={<h4>Loading...</h4>}
      >
        {items.map((item, index) => props.itemRenderer(item, index, props.featurePath))}
      </InfiniteScroll>
    </div>
  );
};

export default ItemScroller;
