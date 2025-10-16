import './Register.css';
import 'bootstrap/dist/css/bootstrap.css';
import { ChangeEvent, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthenticationFormLayout from '../AuthenticationFormLayout';
import { AuthToken, User } from 'tweeter-shared';
import AuthenticationFields from '../AuthenticationFields';
import { useMessageActions } from 'src/components/toaster/MessageHooks';
import { useUserInfoActions } from 'src/components/userInfo/UserHooks';
import { AuthView } from 'src/presenter/AuthPresenter';
import { RegisterPresenter } from 'src/presenter/RegisterPresenter';

interface Props {
  presenterFactory: (listener: AuthView) => RegisterPresenter;
}

const Register = (props: Props) => {
  const [viewState, setViewState] = useState<any>({
    firstName: '',
    lastName: '',
    alias: '',
    password: '',
    imageBytes: new Uint8Array(),
    imageUrl: '',
    imageFileExtension: '',
    rememberMe: false,
    isLoading: false,
  });

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const viewRef = useRef<AuthView>({
    onAuthSuccess: (user: User, authToken: AuthToken, remember: boolean, redirect?: string) => {
      updateUserInfo(user, user, authToken, remember);
      if (redirect) navigate(redirect);
      else navigate(`/feed/${user.alias}`);
    },
    displayErrorMessage: displayErrorMessage,
    onStateChanged: (state) => setViewState(state),
  });

  const presenterRef = useRef<RegisterPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = props.presenterFactory
      ? props.presenterFactory(viewRef.current)
      : new RegisterPresenter(viewRef.current);
  }

  const checkSubmitButtonStatus = (): boolean => {
    return (
      !viewState.firstName ||
      !viewState.lastName ||
      !viewState.alias ||
      !viewState.password ||
      !viewState.imageUrl ||
      !viewState.imageFileExtension
    );
  };

  const registerOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == 'Enter' && !checkSubmitButtonStatus()) {
      doRegister();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    presenterRef.current!.handleImageFile(file);
  };

  // file extension handled by presenter

  const doRegister = async () => {
    try {
      await presenterRef.current!.register();
    } catch (error) {
      displayErrorMessage(`Failed to register user because of exception: ${error}`);
    }
  };

  // Registration logic handled by presenter

  const inputFieldFactory = () => {
    return (
      <>
        <AuthenticationFields
          id="firstNameInput"
          label="First Name"
          placeholder="First Name"
          type="text"
          onKeyDown={registerOnEnter}
          onChange={(event) => presenterRef.current!.setFirstName(event.target.value)}
          value={viewState.firstName}
        />
        <AuthenticationFields
          id="lastNameInput"
          label="Last Name"
          placeholder="Last Name"
          type="text"
          onKeyDown={registerOnEnter}
          onChange={(event) => presenterRef.current!.setLastName(event.target.value)}
          value={viewState.lastName}
        />
        <AuthenticationFields
          id="aliasInput"
          label="Alias"
          placeholder="name@example.com"
          type="text"
          onKeyDown={registerOnEnter}
          onChange={(event) => presenterRef.current!.setAlias(event.target.value)}
          value={viewState.alias}
        />
        <AuthenticationFields
          id="passwordInput"
          label="Password"
          placeholder="Password"
          type="password"
          onKeyDown={registerOnEnter}
          onChange={(event) => presenterRef.current!.setPassword(event.target.value)}
          value={viewState.password}
        />
        <div className="form-floating mb-3">
          <input
            type="file"
            className="d-inline-block py-5 px-4 form-control bottom"
            id="imageFileInput"
            onKeyDown={registerOnEnter}
            onChange={handleFileChange}
          />
          {viewState.imageUrl.length > 0 && (
            <>
              <label htmlFor="imageFileInput">User Image</label>
              <img src={viewState.imageUrl} className="img-thumbnail" alt=""></img>
            </>
          )}
        </div>
      </>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Algready registered? <Link to="/login">Sign in</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Register"
      submitButtonLabel="Register"
      oAuthHeading="Register with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={(val: boolean) => presenterRef.current!.setRememberMe(val)}
      submitButtonDisabled={checkSubmitButtonStatus}
      isLoading={viewState.isLoading}
      submit={doRegister}
    />
  );
};

export default Register;
