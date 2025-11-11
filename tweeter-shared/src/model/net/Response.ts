import { UserDto } from "../dto/UserDto";

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

  constructor(
    items: UserDto[],
    hasMore: boolean,
    success: boolean,
    message: string | null = null
  ) {
    super(success, message);
    this.items = items;
    this.hasMore = hasMore;
  }
}