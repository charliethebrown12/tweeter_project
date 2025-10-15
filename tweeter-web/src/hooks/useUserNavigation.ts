import { useNavigate } from 'react-router-dom';
import { User } from 'tweeter-shared';
import { useMessageActions } from '../components/toaster/MessageHooks';
import { useUserInfo, useUserInfoActions } from '../components/userInfo/UserHooks';

type PathOrFactory = string | ((alias: string) => string) | undefined;

interface UserNavigation {
  navigateToUser: (event: React.MouseEvent, user: User, pathOrFactory?: PathOrFactory) => void;
}

export function useUserNavigation(): UserNavigation {
  const navigate = useNavigate();
  const { displayErrorMessage } = useMessageActions();
  const { displayedUser } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();

  const navigateToUser = (
    event: React.MouseEvent,
    user: User,
    pathOrFactory?: PathOrFactory,
  ): void => {
    event.preventDefault();

    try {
      if (!user.equals(displayedUser!)) {
        setDisplayedUser(user);

        let path: string;
        if (typeof pathOrFactory === 'function') {
          path = pathOrFactory(user.alias);
        } else if (typeof pathOrFactory === 'string') {
          path = `${pathOrFactory}/${user.alias}`;
        } else {
          path = `/${user.alias}`;
        }

        navigate(path);
      }
    } catch (error) {
      displayErrorMessage(`Failed to navigate because of exception: ${error}`);
    }
  };

  return { navigateToUser };
}
