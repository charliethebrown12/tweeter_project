import { useNavigate } from 'react-router-dom';
import { AuthToken, FakeData, User } from 'tweeter-shared';
import { useMessageActions } from '../components/toaster/MessageHooks';
import { useUserInfo, useUserInfoActions } from '../components/userInfo/UserHooks';

type PathOrFactory = string | ((alias: string) => string) | undefined;

interface UserNavigation {
  navigateToUser: (event: React.MouseEvent, pathOrFactory?: PathOrFactory) => Promise<void>;
}

export function useUserNavigation(): UserNavigation {
  const navigate = useNavigate();
  const { displayErrorMessage } = useMessageActions();
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();

  const extractAlias = (value: string): string => {
    const index = value.indexOf('@');
    return value.substring(index);
  };

  const getUser = async (authToken: AuthToken, alias: string): Promise<User | null> => {
    // TODO: Replace with the result of calling server
    return FakeData.instance.findUserByAlias(alias);
  };

  const navigateToUser = async (
    event: React.MouseEvent,
    pathOrFactory?: PathOrFactory,
  ): Promise<void> => {
    event.preventDefault();

    try {
      const alias = extractAlias(event.target.toString());

      const toUser = await getUser(authToken!, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          setDisplayedUser(toUser);

          let path: string;
          if (typeof pathOrFactory === 'function') {
            path = pathOrFactory(toUser.alias);
          } else if (typeof pathOrFactory === 'string') {
            path = `${pathOrFactory}/${toUser.alias}`;
          } else {
            path = `/${toUser.alias}`;
          }

          navigate(path);
        }
      }
    } catch (error) {
      displayErrorMessage(`Failed to get user because of exception: ${error}`);
    }
  };

  return { navigateToUser };
}
