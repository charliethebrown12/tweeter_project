import { AuthToken, User } from 'tweeter-shared';
import { AuthService } from 'src/model.service/AuthService';

export interface AuthState {
  alias: string;
  password: string;
  rememberMe: boolean;
  isLoading: boolean;

  // registration extras
  firstName: string;
  lastName: string;
  imageBytes: Uint8Array;
  imageUrl: string;
  imageFileExtension: string;
}

export interface AuthView {
  onAuthSuccess: (user: User, authToken: AuthToken, remember: boolean, redirect?: string) => void;
  displayErrorMessage: (message: string) => void;
  onStateChanged?: (state: AuthState) => void;
}

export class AuthPresenter {
  private view: AuthView;
  private service: AuthService;
  private state: AuthState;

  constructor(view: AuthView) {
    this.view = view;
    this.service = new AuthService();
    this.state = {
      alias: '',
      password: '',
      rememberMe: false,
      isLoading: false,
      firstName: '',
      lastName: '',
      imageBytes: new Uint8Array(),
      imageUrl: '',
      imageFileExtension: '',
    };

    this.publishState();
  }

  private publishState() {
    if (this.view.onStateChanged) this.view.onStateChanged({ ...this.state });
  }

  public setAlias(alias: string) {
    this.state.alias = alias;
    this.publishState();
  }

  public setPassword(password: string) {
    this.state.password = password;
    this.publishState();
  }

  public setRememberMe(rememberMe: boolean) {
    this.state.rememberMe = rememberMe;
    this.publishState();
  }

  private setIsLoading(isLoading: boolean) {
    this.state.isLoading = isLoading;
    this.publishState();
  }

  public setFirstName(firstName: string) {
    this.state.firstName = firstName;
    this.publishState();
  }

  public setLastName(lastName: string) {
    this.state.lastName = lastName;
    this.publishState();
  }

  private setImageBytes(imageBytes: Uint8Array) {
    this.state.imageBytes = imageBytes;
    this.publishState();
  }

  private setImageUrl(imageUrl: string) {
    this.state.imageUrl = imageUrl;
    this.publishState();
  }

  private setImageFileExtension(imageFileExtension: string) {
    this.state.imageFileExtension = imageFileExtension;
    this.publishState();
  }

  public async login(originalUrl?: string) {
    const { alias, password, rememberMe } = this.state;
    try {
      this.setIsLoading(true);
      const [user, authToken] = await this.service.login(alias, password);
      this.view.onAuthSuccess(user, authToken, rememberMe, originalUrl);
    } catch (error) {
      this.view.displayErrorMessage(`Failed to log user in because of exception: ${error}`);
      throw error;
    } finally {
      this.setIsLoading(false);
    }
  }

  public async register() {
    const { firstName, lastName, alias, password, imageBytes, imageFileExtension, rememberMe } =
      this.state;
    try {
      this.setIsLoading(true);
      const [user, authToken] = await this.service.register(
        firstName,
        lastName,
        alias,
        password,
        imageBytes,
        imageFileExtension,
      );
      this.view.onAuthSuccess(user, authToken, rememberMe, `/feed/${user.alias}`);
    } catch (error) {
      this.view.displayErrorMessage(`Failed to register user because of exception: ${error}`);
      throw error;
    } finally {
      this.setIsLoading(false);
    }
  }

  public handleImageFile(file: File | undefined) {
    if (file) {
      this.setImageUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const imageStringBase64 = event.target?.result as string;

        const imageStringBase64BufferContents = imageStringBase64.split('base64,')[1];

        // browser-safe base64 -> Uint8Array
        const binaryString = atob(imageStringBase64BufferContents);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

        this.setImageBytes(bytes);
      };
      reader.readAsDataURL(file);

      const fileExtension = this.getFileExtension(file);
      if (fileExtension) this.setImageFileExtension(fileExtension);
    } else {
      this.setImageUrl('');
      this.setImageBytes(new Uint8Array());
      this.setImageFileExtension('');
    }
  }

  public getFileExtension(file: File): string | undefined {
    return file.name.split('.').pop();
  }
}
