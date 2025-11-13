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
  public readonly imageUrl: string;
  constructor(firstName: string, lastName: string, alias: string, password: string, imageUrl: string) {
    super(null);
    this.firstName = firstName;
    this.lastName = lastName;
    this.alias = alias;
    this.password = password;
    this.imageUrl = imageUrl;
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