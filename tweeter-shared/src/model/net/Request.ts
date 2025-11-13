export class TweeterRequest {
  public readonly authToken: string | null;

  constructor(authToken: string | null = null) {
    this.authToken = authToken;
  }
}

export class PagedUserItemRequest extends TweeterRequest {
  public readonly targetUserAlias: string;
  public readonly pageSize: number;
  public readonly lastItemAlias: string | null;

  constructor(
    targetUserAlias: string,
    pageSize: number,
    lastItemAlias: string | null,
    authToken: string | null = null,
  ) {
    super(authToken);
    this.targetUserAlias = targetUserAlias;
    this.pageSize = pageSize;
    this.lastItemAlias = lastItemAlias;
  }
}

// Simple alias-only request
export class AliasRequest extends TweeterRequest {
  public readonly alias: string;
  constructor(alias: string, authToken: string | null = null) {
    super(authToken);
    this.alias = alias;
  }
}

// Is follower request: is 'follower' currently following 'followee'?
export class IsFollowerRequest extends TweeterRequest {
  public readonly followerAlias: string;
  public readonly followeeAlias: string;
  constructor(followerAlias: string, followeeAlias: string, authToken: string | null = null) {
    super(authToken);
    this.followerAlias = followerAlias;
    this.followeeAlias = followeeAlias;
  }
}

// Follow or Unfollow action
export class FollowActionRequest extends TweeterRequest {
  public readonly actorAlias: string;
  public readonly targetAlias: string;
  constructor(actorAlias: string, targetAlias: string, authToken: string | null = null) {
    super(authToken);
    this.actorAlias = actorAlias;
    this.targetAlias = targetAlias;
  }
}

export class PagedStatusItemRequest extends TweeterRequest {
  public readonly targetUserAlias: string;
  public readonly pageSize: number;
  public readonly lastItemTimestamp: number | null;
  constructor(
    targetUserAlias: string,
    pageSize: number,
    lastItemTimestamp: number | null,
    authToken: string | null = null,
  ) {
    super(authToken);
    this.targetUserAlias = targetUserAlias;
    this.pageSize = pageSize;
    this.lastItemTimestamp = lastItemTimestamp;
  }
}