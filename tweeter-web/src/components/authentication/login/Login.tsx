import './Login.css';
import 'bootstrap/dist/css/bootstrap.css';
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthenticationFormLayout from '../AuthenticationFormLayout';
import { AuthToken, User } from 'tweeter-shared';
import AuthenticationFields from '../AuthenticationFields';
import { useMessageActions } from 'src/components/toaster/MessageHooks';
import { useUserInfoActions } from 'src/components/userInfo/UserHooks';
import { AuthPresenter, AuthView } from 'src/presenter/AuthPresenter';

interface Props {
  originalUrl?: string;
  presenterFactory?: (listener: AuthView) => AuthPresenter;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const viewRef = useRef<AuthView>({
    onAuthSuccess: (user: User, authToken: AuthToken, remember: boolean, redirect?: string) => {
      updateUserInfo(user, user, authToken, remember);
      if (redirect) {
        navigate(redirect);
      } else if (!!props.originalUrl) {
        navigate(props.originalUrl);
      } else {
        navigate(`/feed/${user.alias}`);
      }
    },
    displayErrorMessage: displayErrorMessage,
  });

  const presenterRef = useRef<AuthPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = props.presenterFactory
      ? props.presenterFactory(viewRef.current)
      : new AuthPresenter(viewRef.current);
  }

  const checkSubmitButtonStatus = (): boolean => {
    return !alias || !password;
  };

  const loginOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == 'Enter' && !checkSubmitButtonStatus()) {
      doLogin();
    }
  };

  const doLogin = async () => {
    try {
      setIsLoading(true);
      await presenterRef.current!.login(props.originalUrl);
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication logic is handled via presenter

  const inputFieldFactory = () => {
    return (
      <>
        <AuthenticationFields
          id="aliasInput"
          label="Alias"
          placeholder="name@example.com"
          type="text"
          onKeyDown={loginOnEnter}
          onChange={(event) => setAlias(event.target.value)}
        />
        <AuthenticationFields
          id="passwordInput"
          label="Password"
          placeholder="Password"
          type="password"
          onKeyDown={loginOnEnter}
          onChange={(event) => setPassword(event.target.value)}
        />
      </>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Not registered? <Link to="/register">Register</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Sign In"
      submitButtonLabel="Sign in"
      oAuthHeading="Sign in with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
  setRememberMe={(val: boolean) => presenterRef.current!.setRememberMe(val)}
      submitButtonDisabled={checkSubmitButtonStatus}
      isLoading={isLoading}
      submit={doLogin}
    />
  );
};

export default Login;
