import { TweeterRequest } from './Request';

export class LoginRequest extends TweeterRequest {
  public readonly alias: string;
  public readonly password: string;
  constructor(alias: string, password: string) {
    super(null);
    this.alias = alias;
    this.password = password;
  }
}

export class RegisterRequest extends TweeterRequest {
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly alias: string;
  public readonly password: string;
  public readonly imageBytesBase64: string;
  public readonly imageType: string;
  constructor(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageBytesBase64: string,
    imageType: string,
  ) {
    super(null);
    this.firstName = firstName;
    this.lastName = lastName;
    this.alias = alias;
    this.password = password;
    this.imageBytesBase64 = imageBytesBase64;
    this.imageType = imageType;
  }
}

export class LogoutRequest extends TweeterRequest {
  public readonly authToken: string;
  constructor(authToken: string) {
    super(authToken);
    this.authToken = authToken;
  }
}

export class PostStatusRequest extends TweeterRequest {
  public readonly authToken: string;
  public readonly post: string;
  constructor(authToken: string, post: string) {
    super(authToken);
    this.authToken = authToken;
    this.post = post;
  }
}