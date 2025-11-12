"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowService = void 0;
const tweeter_shared_1 = require("tweeter-shared");
// This is the SERVER-SIDE service. It does the REAL work.
class FollowService {
    /**
     * This method matches the one we've been building for the 'getFollowees'
     * feature. The Lambda handler will parse the 'PagedUserItemRequest'
     * and pass it directly to this method.
     */
    async getMoreFollowees(request) {
        // We need to get the 'lastFollowee' as a User object to pass to FakeData,
        // but the request only gives us the alias (string).
        let lastFollowee = null;
        if (request.lastItemAlias) {
            // We assume FakeData has a method to find a user by their alias.
            lastFollowee = tweeter_shared_1.FakeData.instance.findUserByAlias(request.lastItemAlias);
        }
        // Call FakeData with the parameters from the request
        return tweeter_shared_1.FakeData.instance.getPageOfUsers(lastFollowee, request.pageSize, request.targetUserAlias);
    }
    /**
     * These other methods are not yet refactored to use request objects.
     * Their Lambda handlers will parse the request and call these methods
     * with the original M2 parameters.
     */
    async loadMoreFollowers(_authToken, userAlias, pageSize, lastFollower) {
        return tweeter_shared_1.FakeData.instance.getPageOfUsers(lastFollower, pageSize, userAlias);
    }
    async isFollower(_authToken, _currentUser, _displayedUser) {
        return tweeter_shared_1.FakeData.instance.isFollower();
    }
    async getFolloweeCount(_authToken, user) {
        return tweeter_shared_1.FakeData.instance.getFolloweeCount(user.alias);
    }
    async getFollowerCount(_authToken, user) {
        return tweeter_shared_1.FakeData.instance.getFollowerCount(user.alias);
    }
    async follow(_authToken, userToFollow) {
        await new Promise((r) => setTimeout(r, 200));
        const followerCount = await this.getFollowerCount(_authToken, userToFollow);
        const followeeCount = await this.getFolloweeCount(_authToken, userToFollow);
        return [followerCount, followeeCount];
    }
    async unfollow(_authToken, userToUnfollow) {
        await new Promise((r) => setTimeout(r, 200));
        const followerCount = await this.getFollowerCount(_authToken, userToUnfollow);
        const followeeCount = await this.getFolloweeCount(_authToken, userToUnfollow);
        return [followerCount, followeeCount];
    }
}
exports.FollowService = FollowService;
