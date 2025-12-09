import { User, AuthToken } from 'tweeter-shared';
import { Service } from './Service';
import { ServerFacade } from 'src/net/ServerFacade';

export class UserService implements Service {
  private serverFacade = new ServerFacade();
  public async getUser(_authToken: AuthToken, alias: string): Promise<User | null> {
    return this.serverFacade.getUser(alias);
  }

  public async login(_alias: string, _password: string): Promise<[User, AuthToken]> {
    const { authToken, alias } = await this.serverFacade.login(_alias, _password);
    const user = await this.getUser({ token: authToken } as AuthToken, alias);
    if (!user) throw new Error('Invalid alias or password');
    return [user, { token: authToken } as AuthToken];
  }

  public async register(
    _firstName: string,
    _lastName: string,
    _alias: string,
    _password: string,
    _userImageBytes: Uint8Array,
    _imageFileExtension: string,
  ): Promise<[User, AuthToken]> {
    const dataUrl = this.bytesToDataUrl(_userImageBytes, _imageFileExtension);
    const { authToken, alias } = await this.serverFacade.register(
      _firstName,
      _lastName,
      _alias,
      _password,
      dataUrl,
    );
    const user = await this.getUser({ token: authToken } as AuthToken, alias);
    if (!user) throw new Error('Invalid registration');
    return [user, { token: authToken } as AuthToken];
  }

  public async logout(_authToken: AuthToken | null): Promise<void> {
    if (_authToken?.token) {
      await this.serverFacade.logout(_authToken.token);
    }
  }

  private bytesToDataUrl(bytes: Uint8Array, fileExt: string): string {
    if (!bytes || bytes.length === 0) throw new Error('Missing image bytes');
    const mime = this.extensionToMime(fileExt);
    const base64 = this.uint8ToBase64(bytes);
    return `data:${mime};base64,${base64}`;
  }

  private extensionToMime(ext: string): string {
    const e = (ext || '').toLowerCase();
    switch (e) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/png';
    }
  }

  private uint8ToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    // btoa is available in browsers; this code runs in the browser
    return btoa(binary);
  }
}
