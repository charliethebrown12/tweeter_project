export class TweeterRequest {
  // In Milestone 4, you'll add the AuthToken here
  // public readonly authToken: string;
  
  constructor() {
    // This will be used later
    // this.authToken = authToken;
  }
}

export class PagedUserItemRequest extends TweeterRequest {
  public readonly targetUserAlias: string;
  public readonly pageSize: number;
  public readonly lastItemAlias: string | null;

  constructor(
    targetUserAlias: string,
    pageSize: number,
    lastItemAlias: string | null
    // authToken: string
  ) {
    super(); // super(authToken);
    this.targetUserAlias = targetUserAlias;
    this.pageSize = pageSize;
    this.lastItemAlias = lastItemAlias;
  }
}