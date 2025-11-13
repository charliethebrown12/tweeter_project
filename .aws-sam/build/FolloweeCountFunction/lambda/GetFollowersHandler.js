"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const tweeter_shared_1 = require("tweeter-shared");
const FollowService_1 = require("../service/FollowService");
// The handler function
const handler = async (event) => {
    // 1. Parse the request (supports proxy and non-proxy integrations)
    const request = typeof event === 'string'
        ? JSON.parse(event)
        : event?.body
            ? JSON.parse(event.body)
            : event;
    // 2. Delegate to the service
    // (You'll need to instantiate your service)
    const service = new FollowService_1.FollowService();
    const [users, hasMore] = await service.getMoreFollowees(request);
    const dtos = users.map((user) => new tweeter_shared_1.UserDto(user.firstName, user.lastName, user.alias, user.imageUrl));
    // 3. Create and return the response (non-proxy integration: return the object directly)
    const response = new tweeter_shared_1.PagedUserItemResponse(dtos, hasMore, true, null);
    return response;
};
exports.handler = handler;
