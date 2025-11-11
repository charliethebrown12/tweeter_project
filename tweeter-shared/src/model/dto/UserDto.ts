export class UserDto {
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly alias: string;
  public readonly imageUrl: string;

  constructor(
    firstName: string,
    lastName: string,
    alias: string,
    imageUrl: string
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.alias = alias;
    this.imageUrl = imageUrl;
  }
}