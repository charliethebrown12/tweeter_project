import { UserDto } from '../dto/UserDto';

export class TweeterResponse {
  public readonly success: boolean;
  public readonly message: string | null;

  constructor(success: boolean, message: string | null = null) {
    this.success = success;
    this.message = message;
  }
}

// (Add this to the bottom of the file)
export class PagedUserItemResponse extends TweeterResponse {
  public readonly items: UserDto[];
  public readonly hasMore: boolean;

  constructor(items: UserDto[], hasMore: boolean, success: boolean, message: string | null = null) {
    super(success, message);
    this.items = items;
    this.hasMore = hasMore;
  }
}

export class BooleanResponse extends TweeterResponse {
  public readonly value: boolean;
  constructor(value: boolean, success: boolean, message: string | null = null) {
    super(success, message);
    this.value = value;
  }
}

export class CountResponse extends TweeterResponse {
  public readonly count: number;
  constructor(count: number, success: boolean, message: string | null = null) {
    super(success, message);
    this.count = count;
  }
}

export class FollowCountsResponse extends TweeterResponse {
  public readonly followerCount: number;
  public readonly followeeCount: number;
  constructor(
    followerCount: number,
    followeeCount: number,
    success: boolean,
    message: string | null = null,
  ) {
    super(success, message);
    this.followerCount = followerCount;
    this.followeeCount = followeeCount;
  }
}

import { StatusDto } from '../dto/StatusDto';
export class PagedStatusItemResponse extends TweeterResponse {
  public readonly items: StatusDto[];
  public readonly hasMore: boolean;
  constructor(
    items: StatusDto[],
    hasMore: boolean,
    success: boolean,
    message: string | null = null,
  ) {
    super(success, message);
    this.items = items;
    this.hasMore = hasMore;
  }
}
