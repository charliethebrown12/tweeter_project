import { Status } from '../domain/Status';

export class StatusDto {
  public readonly post: string;
  public readonly userAlias: string;
  public readonly userFirstName: string;
  public readonly userLastName: string;
  public readonly userImageUrl: string;
  public readonly timestamp: number;

  constructor(
    post: string,
    userAlias: string,
    userFirstName: string,
    userLastName: string,
    userImageUrl: string,
    timestamp: number,
  ) {
    this.post = post;
    this.userAlias = userAlias;
    this.userFirstName = userFirstName;
    this.userLastName = userLastName;
    this.userImageUrl = userImageUrl;
    this.timestamp = timestamp;
  }

  public static fromDomain(status: Status): StatusDto {
    return new StatusDto(
      status.post,
      status.user.alias,
      status.user.firstName,
      status.user.lastName,
      status.user.imageUrl,
      status.timestamp,
    );
  }
}
