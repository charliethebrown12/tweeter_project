import { AuthToken, User } from 'tweeter-shared';
import { UserService } from 'src/model.service/UserService';
import { Presenter, View } from './Presenter';

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

export interface AuthView extends View {
  onAuthSuccess: (user: User, authToken: AuthToken, remember: boolean, redirect?: string) => void;
  onStateChanged?: (state: AuthState) => void;
}

export class AuthPresenter extends Presenter<AuthView> {
  protected service: UserService;
  protected state: AuthState;

  constructor(view: AuthView) {
    super(view);
    this.service = new UserService();
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

  protected async authenticate(
    authOperation: () => Promise<[User, AuthToken]>,
    operationDescription: string,
    originalUrl?: string
  ) {
    this.doFailureReportingOperation(async () => {
      this.setIsLoading(true);
      const [user, authToken] = await authOperation();
      this.view.onAuthSuccess(user, authToken, this.state.rememberMe, originalUrl);
      this.setIsLoading(false);
    }, operationDescription);
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
