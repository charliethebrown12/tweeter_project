import './App.css';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/authentication/login/Login';
import Register from './components/authentication/register/Register';
import MainLayout from './components/mainLayout/MainLayout';
import Toaster from './components/toaster/Toaster';
import ItemScroller from './components/mainLayout/ItemScroller';
import StatusItem from './components/statusItem/StatusItem';
import UserItem from './components/userItem/UserItem';
import { useUserInfo } from './components/userInfo/UserHooks';
import { FolloweePresenter } from './presenter/FolloweePresenter';
import { FollowerPresenter } from './presenter/FollowerPresenter';
import { FeedPresenter } from './presenter/FeedPresenter';
import { StoryPresenter } from './presenter/StoryPresenter';
import { RegisterPresenter } from './presenter/RegisterPresenter';
import { Status, User } from 'tweeter-shared';
import { PageItemView } from './presenter/PageItemPresenter';

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();

  const statusRenderer = (status: Status, index: number, featurePath: string) => (
    <div key={index} className="row mb-3 mx-0 px-0 border rounded bg-white">
      <StatusItem status={status} featurePath={featurePath} />
    </div>
  );

  const userRenderer = (user: User, index: number, featurePath: string) => (
    <div key={index} className="row mb-3 mx-0 px-0 border rounded bg-white">
      <UserItem user={user} featurePath={featurePath} />
    </div>
  );

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
        <Route
          path="feed/:displayedUser"
          element={
            <ItemScroller<Status>
              key={`feed-${displayedUser!.alias}`}
              featurePath="/feed"
              presenterFactory={(view: PageItemView<Status>) => new FeedPresenter(view)}
              itemRenderer={statusRenderer}
            />
          }
        />
        <Route
          path="story/:displayedUser"
          element={
            <ItemScroller<Status>
              key={`story-${displayedUser!.alias}`}
              featurePath="/story"
              presenterFactory={(view: PageItemView<Status>) => new StoryPresenter(view)}
              itemRenderer={statusRenderer}
            />
          }
        />
        <Route
          path="followees/:displayedUser"
          element={
            <ItemScroller<User>
              key={`followees-${displayedUser!.alias}`}
              featurePath="/followees"
              presenterFactory={(view: PageItemView<User>) => new FolloweePresenter(view)}
              itemRenderer={userRenderer}
            />
          }
        />
        <Route
          path="followers/:displayedUser"
          element={
            <ItemScroller<User>
              key={`followers-${displayedUser!.alias}`}
              featurePath="/followers"
              presenterFactory={(view: PageItemView<User>) => new FollowerPresenter(view)}
              itemRenderer={userRenderer}
            />
          }
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/register"
        element={<Register presenterFactory={(listener) => new RegisterPresenter(listener)} />}
      />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
