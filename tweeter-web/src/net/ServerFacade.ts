import { PagedUserItemRequest } from "tweeter-shared/src/model/net/Request";
import { PagedUserItemResponse } from "tweeter-shared/src/model/net/Response";
import { User } from "tweeter-shared/src/model/domain/User";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  // IMPORTANT: You will get this URL after you run 'sam deploy'
  // for your tweeter-server.
  private SERVER_URL = "TODO: Set this value.";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  /**
   * Fetches a page of followees from the server.
   *
   * @param {PagedUserItemRequest} request - The request object containing user alias, page size, and last item.
   * @returns {Promise<[User[], boolean]>} A tuple containing the list of users and a boolean indicating if there are more pages.
   */
  public async getMoreFollowees(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    
    // Call the doPost method from ClientCommunicator
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/followee/list"); // This endpoint must match your template.yaml

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
      throw new Error(response.message ?? "An unknown error occurred.");
    }
  }

  // TODO: Add other methods here (getMoreFollowers, follow, unfollow, etc.)
  // Each one will follow the same pattern:
  // 1. Call clientCommunicator.doPost with a new request object and endpoint.
  // 2. Get a response object back.
  // 3. Process the response (like mapping DTOs) and return the data.
}