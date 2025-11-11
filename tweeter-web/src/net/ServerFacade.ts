import { PagedUserItemRequest } from "tweeter-shared/src/model/net/Request";
import { PagedUserItemResponse } from "tweeter-shared/src/model/net/Response";
import { User } from "tweeter-shared/src/model/domain/User";
import { ClientCommunicator } from "./ClientCommunicator";

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

  // TODO: Add other methods here (getMoreFollowers, follow, unfollow, etc.)
  // Each one will follow the same pattern:
  // 1. Call clientCommunicator.doPost with a new request object and endpoint.
  // 2. Get a response object back.
  // 3. Process the response (like mapping DTOs) and return the data.
}