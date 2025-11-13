"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followeeCountHandler = exports.followerCountHandler = exports.unfollowHandler = exports.followHandler = exports.isFollowerHandler = exports.followersListHandler = void 0;
const tweeter_shared_1 = require("tweeter-shared");
const FollowService_1 = require("../service/FollowService");
// Followers list (paged)
const followersListHandler = async (event) => {
    const request = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
    const service = new FollowService_1.FollowService();
    const [users, hasMore] = await service.getMoreFollowers(request);
    const dtos = users.map((u) => new tweeter_shared_1.UserDto(u.firstName, u.lastName, u.alias, u.imageUrl));
    const response = new tweeter_shared_1.PagedUserItemResponse(dtos, hasMore, true, null);
    return response;
};
exports.followersListHandler = followersListHandler;
// Is follower
const isFollowerHandler = async (event) => {
    const req = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
    const service = new FollowService_1.FollowService();
    const value = await service.isFollower(undefined, { firstName: '', lastName: '', alias: req.followerAlias, imageUrl: '' }, { firstName: '', lastName: '', alias: req.followeeAlias, imageUrl: '' });
    const response = new tweeter_shared_1.BooleanResponse(value, true, null);
    return response;
};
exports.isFollowerHandler = isFollowerHandler;
// Follow
const followHandler = async (event) => {
    const req = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
    const service = new FollowService_1.FollowService();
    const [followerCount, followeeCount] = await service.follow(undefined, { firstName: '', lastName: '', alias: req.targetAlias, imageUrl: '' });
    const response = new tweeter_shared_1.FollowCountsResponse(followerCount, followeeCount, true, null);
    return response;
};
exports.followHandler = followHandler;
// Unfollow
const unfollowHandler = async (event) => {
    const req = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
    const service = new FollowService_1.FollowService();
    const [followerCount, followeeCount] = await service.unfollow(undefined, { firstName: '', lastName: '', alias: req.targetAlias, imageUrl: '' });
    const response = new tweeter_shared_1.FollowCountsResponse(followerCount, followeeCount, true, null);
    return response;
};
exports.unfollowHandler = unfollowHandler;
// Follower count
const followerCountHandler = async (event) => {
    const req = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
    const service = new FollowService_1.FollowService();
    const count = await service.getFollowerCount(undefined, { firstName: '', lastName: '', alias: req.alias, imageUrl: '' });
    const response = new tweeter_shared_1.CountResponse(count, true, null);
    return response;
};
exports.followerCountHandler = followerCountHandler;
// Followee count
const followeeCountHandler = async (event) => {
    const req = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
    const service = new FollowService_1.FollowService();
    const count = await service.getFolloweeCount(undefined, { firstName: '', lastName: '', alias: req.alias, imageUrl: '' });
    const response = new tweeter_shared_1.CountResponse(count, true, null);
    return response;
};
exports.followeeCountHandler = followeeCountHandler;
