import {
  PagedUserItemRequest,
  AliasRequest,
  IsFollowerRequest,
  FollowActionRequest,
  PagedStatusItemRequest,
} from 'tweeter-shared/src/model/net/Request';
import {
  PagedUserItemResponse,
  CountResponse,
  BooleanResponse,
  FollowCountsResponse,
  PagedStatusItemResponse,
} from 'tweeter-shared/src/model/net/Response';
import { User } from 'tweeter-shared/src/model/domain/User';
import { Status } from 'tweeter-shared/src/model/domain/Status';
import { ClientCommunicator } from './ClientCommunicator';
import {
  LoginRequest,
  RegisterRequest,
  LogoutRequest,
  PostStatusRequest,
} from 'tweeter-shared/src/model/net/AuthRequests';
import { AuthResponse } from 'tweeter-shared/src/model/net/AuthResponses';

export class ServerFacade {
  private SERVER_URL: string;
  private clientCommunicator: ClientCommunicator;

  constructor() {
    // Read the URL from the environment variable
    // This is the standard way to access .env variables in a React app
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      // This provides a clear error in the browser console if the .env file is missing
      console.error('FATAL: VITE_API_URL is not defined in your .env file.');
      console.error("Please create a .env file in your client's root directory and add:");
      console.error('VITE_API_URL=https://[your_api_url].amazonaws.com/prod');
    }

    // Use a fallback to prevent a crash, but it will fail on network calls
    this.SERVER_URL = apiUrl || 'http://error-url-not-set.com';
    this.clientCommunicator = new ClientCommunicator(this.SERVER_URL);
  }

  public async getUser(alias: string): Promise<User | null> {
    const resp = await this.clientCommunicator.doPost<AliasRequest, any>(
      new AliasRequest(alias),
      '/user/get',
    );
    if (resp && resp.success && resp.user) {
      const u = resp.user as {
        firstName: string;
        lastName: string;
        alias: string;
        imageUrl: string;
      };
      return new User(u.firstName, u.lastName, u.alias, u.imageUrl);
    }
    return null;
  }

  public async getMoreFollowees(request: PagedUserItemRequest): Promise<[User[], boolean]> {
    // Call the doPost method from ClientCommunicator
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, '/followee/list'); // This endpoint must match your template.yaml

    // Convert the UserDto array returned by ClientCommunicator to a "smart" User array
    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto)) // Uses the static method we defined
        : null;

    // Handle errors
    if (response.success) {
      if (items == null) {
        throw new Error(`No followees found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? 'An unknown error occurred.');
    }
  }

  public async getMoreFollowers(request: PagedUserItemRequest): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, '/follower/list');

    const items: User[] | null =
      response.success && response.items ? response.items.map((dto) => User.fromDto(dto)) : null;

    if (response.success) {
      if (items == null) {
        throw new Error(`No followers found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? 'An unknown error occurred.');
    }
  }

  public async getFollowerCount(alias: string): Promise<number> {
    const response = await this.clientCommunicator.doPost<AliasRequest, CountResponse>(
      new AliasRequest(alias),
      '/follow/follower/count',
    );
    if (response.success) {
      return response.count;
    } else {
      console.error(response);
      throw new Error(response.message ?? 'An unknown error occurred.');
    }
  }

  public async getFolloweeCount(alias: string): Promise<number> {
    const response = await this.clientCommunicator.doPost<AliasRequest, CountResponse>(
      new AliasRequest(alias),
      '/follow/followee/count',
    );
    if (response.success) {
      return response.count;
    } else {
      console.error(response);
      throw new Error(response.message ?? 'An unknown error occurred.');
    }
  }

  public async isFollower(followerAlias: string, followeeAlias: string): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<IsFollowerRequest, BooleanResponse>(
      new IsFollowerRequest(followerAlias, followeeAlias),
      '/follow/isfollower',
    );
    if (response.success) {
      return response.value;
    } else {
      console.error(response);
      throw new Error(response.message ?? 'An unknown error occurred.');
    }
  }

  public async follow(actorAlias: string, targetAlias: string): Promise<[number, number]> {
    const response = await this.clientCommunicator.doPost<
      FollowActionRequest,
      FollowCountsResponse
    >(new FollowActionRequest(actorAlias, targetAlias), '/follow/follow');
    if (response.success) {
      return [response.followerCount, response.followeeCount];
    } else {
      console.error(response);
      throw new Error(response.message ?? 'An unknown error occurred.');
    }
  }

  public async unfollow(actorAlias: string, targetAlias: string): Promise<[number, number]> {
    const response = await this.clientCommunicator.doPost<
      FollowActionRequest,
      FollowCountsResponse
    >(new FollowActionRequest(actorAlias, targetAlias), '/follow/unfollow');
    if (response.success) {
      return [response.followerCount, response.followeeCount];
    } else {
      console.error(response);
      throw new Error(response.message ?? 'An unknown error occurred.');
    }
  }

  public async getMoreFeed(request: PagedStatusItemRequest): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedStatusItemRequest,
      PagedStatusItemResponse
    >(request, '/feed/list');

    if (response.success) {
      const items: Status[] = response.items.map(
        (dto) =>
          new Status(
            dto.post,
            new User(dto.userFirstName, dto.userLastName, dto.userAlias, dto.userImageUrl),
            dto.timestamp,
          ),
      );
      return [items, response.hasMore];
    } else {
      console.error(response);
      throw new Error(response.message ?? 'An unknown error occurred.');
    }
  }

  public async getMoreStory(request: PagedStatusItemRequest): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedStatusItemRequest,
      PagedStatusItemResponse
    >(request, '/story/list');

    if (response.success) {
      const items: Status[] = response.items.map(
        (dto) =>
          new Status(
            dto.post,
            new User(dto.userFirstName, dto.userLastName, dto.userAlias, dto.userImageUrl),
            dto.timestamp,
          ),
      );
      return [items, response.hasMore];
    } else {
      console.error(response);
      throw new Error(response.message ?? 'An unknown error occurred.');
    }
  }

  public async login(
    alias: string,
    password: string,
  ): Promise<{ authToken: string; alias: string }> {
    const effectiveAlias = (alias ?? '').trim() || '@allen';
    const response = await this.clientCommunicator.doPost<LoginRequest, AuthResponse>(
      new LoginRequest(effectiveAlias, password),
      '/user/login',
    );
    if (response.success && response.authToken && response.alias) {
      return { authToken: response.authToken, alias: response.alias };
    } else {
      throw new Error(response.message ?? 'Login failed');
    }
  }

  public async logout(authToken: string): Promise<void> {
    const response = await this.clientCommunicator.doPost<LogoutRequest, AuthResponse>(
      new LogoutRequest(authToken),
      '/user/logout',
    );
    if (!response.success) throw new Error(response.message ?? 'Logout failed');
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageUrl: string,
  ): Promise<{ authToken: string; alias: string }> {
    const response = await this.clientCommunicator.doPost<RegisterRequest, AuthResponse>(
      new RegisterRequest(firstName, lastName, alias, password, imageUrl),
      '/user/create',
    );
    if (response.success && response.authToken && response.alias) {
      return { authToken: response.authToken, alias: response.alias };
    } else {
      throw new Error(response.message ?? 'Register failed');
    }
  }

  public async postStatus(authToken: string, post: string): Promise<void> {
    const response = await this.clientCommunicator.doPost<PostStatusRequest, AuthResponse>(
      new PostStatusRequest(authToken, post),
      '/status/post',
    );
    if (!response.success) throw new Error(response.message ?? 'Post failed');
  }
}
