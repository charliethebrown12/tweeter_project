import './Register.css';
import 'bootstrap/dist/css/bootstrap.css';
import { ChangeEvent, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthenticationFormLayout from '../AuthenticationFormLayout';
import { AuthToken, User } from 'tweeter-shared';
import { Buffer } from 'buffer';
import AuthenticationFields from '../AuthenticationFields';
import { useMessageActions } from 'src/components/toaster/MessageHooks';
import { useUserInfoActions } from 'src/components/userInfo/UserHooks';
import { AuthPresenter, AuthView } from 'src/presenter/AuthPresenter';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [imageBytes, setImageBytes] = useState<Uint8Array>(new Uint8Array());
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFileExtension, setImageFileExtension] = useState<string>('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  });

  const presenterRef = useRef<AuthPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = new AuthPresenter(viewRef.current);
  }

  const checkSubmitButtonStatus = (): boolean => {
    return !firstName || !lastName || !alias || !password || !imageUrl || !imageFileExtension;
  };

  const registerOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == 'Enter' && !checkSubmitButtonStatus()) {
      doRegister();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleImageFile(file);
  };

  const handleImageFile = (file: File | undefined) => {
    if (file) {
      setImageUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const imageStringBase64 = event.target?.result as string;

        // Remove unnecessary file metadata from the start of the string.
        const imageStringBase64BufferContents = imageStringBase64.split('base64,')[1];

        const bytes: Uint8Array = Buffer.from(imageStringBase64BufferContents, 'base64');

        setImageBytes(bytes);
      };
      reader.readAsDataURL(file);

      // Set image file extension (and move to a separate method)
      const fileExtension = getFileExtension(file);
      if (fileExtension) {
        setImageFileExtension(fileExtension);
      }
    } else {
      setImageUrl('');
      setImageBytes(new Uint8Array());
    }
  };

  const getFileExtension = (file: File): string | undefined => {
    return file.name.split('.').pop();
  };

  const doRegister = async () => {
    try {
      setIsLoading(true);
      await presenterRef.current!.register(
        firstName,
        lastName,
        alias,
        password,
        imageBytes,
        imageFileExtension,
        rememberMe,
      );
    } catch (error) {
      displayErrorMessage(`Failed to register user because of exception: ${error}`);
    } finally {
      setIsLoading(false);
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
          onChange={(event) => setFirstName(event.target.value)}
        />
        <AuthenticationFields
          id="lastNameInput"
          label="Last Name"
          placeholder="Last Name"
          type="text"
          onKeyDown={registerOnEnter}
          onChange={(event) => setLastName(event.target.value)}
        />
        <AuthenticationFields
          id="aliasInput"
          label="Alias"
          placeholder="name@example.com"
          type="text"
          onKeyDown={registerOnEnter}
          onChange={(event) => setAlias(event.target.value)}
        />
        <AuthenticationFields
          id="passwordInput"
          label="Password"
          placeholder="Password"
          type="password"
          onKeyDown={registerOnEnter}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="form-floating mb-3">
          <input
            type="file"
            className="d-inline-block py-5 px-4 form-control bottom"
            id="imageFileInput"
            onKeyDown={registerOnEnter}
            onChange={handleFileChange}
          />
          {imageUrl.length > 0 && (
            <>
              <label htmlFor="imageFileInput">User Image</label>
              <img src={imageUrl} className="img-thumbnail" alt=""></img>
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
      setRememberMe={setRememberMe}
      submitButtonDisabled={checkSubmitButtonStatus}
      isLoading={isLoading}
      submit={doRegister}
    />
  );
};

export default Register;
