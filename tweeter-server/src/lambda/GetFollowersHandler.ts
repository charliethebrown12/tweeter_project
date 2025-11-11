import { UserDto } from "tweeter-shared/src/model/dto/UserDto";
import { FollowService } from "../service/FollowService";
import { PagedUserItemRequest } from "tweeter-shared/src/model/net/Request";
import { PagedUserItemResponse } from "tweeter-shared/src/model/net/Response";

// The handler function
export const handler = async (event: any): Promise<any> => {

  // 1. Parse the request from the event body
  // API Gateway will send the request as a JSON string
  const request: PagedUserItemRequest = JSON.parse(event.body);

  // 2. Delegate to the service
  // (You'll need to instantiate your service)
  const service = new FollowService();
  const [users, hasMore] = await service.getMoreFollowees(request);

const dtos: UserDto[] = users.map((user) => 
    new UserDto(user.firstName, user.lastName, user.alias, user.imageUrl)
  );

  // 3. Create and return the response
  // API Gateway expects a specific JSON structure
  const response = new PagedUserItemResponse(dtos, hasMore, true, null);

  return {
    statusCode: 200,
    body: JSON.stringify(response),
    // Add headers for CORS
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
};