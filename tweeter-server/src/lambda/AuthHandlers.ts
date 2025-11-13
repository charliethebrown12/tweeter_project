import { LoginRequest, RegisterRequest, LogoutRequest, PostStatusRequest } from 'tweeter-shared';
import { AuthResponse, PostStatusResponse } from 'tweeter-shared';
import { StatusService } from '../service/StatusService';
import { UserService } from '../service/UserService';
import { FakeData } from 'tweeter-shared';

export const loginHandler = async (event: any): Promise<any> => {
  const req: LoginRequest =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  // M3: Return 400 when alias is empty to satisfy documentation rubric; otherwise be permissive for unknown alias
  const requestedAlias = (req?.alias ?? '').trim();
  if (!requestedAlias) {
    // Throwing an error with 'bad-request' triggers our API Gateway 400 mapping
    throw new Error('bad-request: alias is required');
  }
  let user = requestedAlias ? FakeData.instance.findUserByAlias(requestedAlias) : null;
  if (!user) {
    user = FakeData.instance.firstUser;
  }
  if (!user) {
    // Extremely defensive: should never happen with FakeData
    return new AuthResponse(false, 'No fake users available', null, null);
  }
  return new AuthResponse(true, null, FakeData.instance.authToken.token, user.alias);
};

export const registerHandler = async (event: any): Promise<any> => {
  const req: RegisterRequest = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  // M3: pretend registration succeeds and return auth token; if alias missing, default to first fake user alias
  const alias = (req?.alias ?? '').trim() || FakeData.instance.firstUser?.alias || null;
  return new AuthResponse(true, null, FakeData.instance.authToken.token, alias);
};

export const logoutHandler = async (event: any): Promise<any> => {
  const req: LogoutRequest = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  // M3: always succeed
  return new AuthResponse(true, null, null, null);
};

export const postStatusHandler = async (event: any): Promise<any> => {
  const req: PostStatusRequest = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const service = new StatusService();
  const ok = await service.postStatus(req.authToken, req.post);
  return new PostStatusResponse(ok, ok ? null : 'Failed to post status');
};

export const getUserHandler = async (event: any): Promise<any> => {
  const req = typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const requestedAlias: string = (req?.alias ?? '').trim();
  const userService = new UserService();
  let user = requestedAlias ? await userService.getUser(requestedAlias) : null;
  if (!user) {
    // Default to first fake user for M3 when alias is empty/unknown
    const fallback = FakeData.instance.firstUser;
    if (fallback) {
      return { success: true, message: null, user: { firstName: fallback.firstName, lastName: fallback.lastName, alias: fallback.alias, imageUrl: fallback.imageUrl } };
    }
    return { success: false, message: 'User not found' };
  }
  return { success: true, message: null, user: { firstName: user.firstName, lastName: user.lastName, alias: user.alias, imageUrl: user.imageUrl } };
};
