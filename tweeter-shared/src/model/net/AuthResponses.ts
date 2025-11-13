import { TweeterResponse } from './Response';

export class AuthResponse extends TweeterResponse {
  public readonly authToken: string | null;
  public readonly alias: string | null;
  constructor(success: boolean, message: string | null, authToken: string | null, alias: string | null) {
    super(success, message);
    this.authToken = authToken;
    this.alias = alias;
  }
}

export class PostStatusResponse extends TweeterResponse {
  constructor(success: boolean, message: string | null = null) {
    super(success, message);
  }
}