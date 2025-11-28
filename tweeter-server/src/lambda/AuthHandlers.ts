import {
  LoginRequest,
  RegisterRequest,
  LogoutRequest,
  PostStatusRequest,
  User,
} from 'tweeter-shared';
import { AuthResponse, PostStatusResponse } from 'tweeter-shared';
import { StatusService } from '../service/StatusService';
import { UserService } from '../service/UserService';
import { createRuntimeDaoFactory } from '../dao/RuntimeDaoFactory';
import * as bcrypt from 'bcryptjs';

export const loginHandler = async (event: any): Promise<any> => {
  const req: LoginRequest =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  // M3: Return 400 when alias is empty
  const requestedAlias = (req?.alias ?? '').trim();
  const password = req?.password ?? '';
  if (!requestedAlias) {
    // Throwing an error with 'bad-request' triggers our API Gateway 400 mapping
    throw new Error('bad-request: alias is required');
  }
  const factory = createRuntimeDaoFactory();
  const userDao = factory.createUserDao();
  const authDao = factory.createAuthDao();
  let user = await userDao.getUserByAlias(requestedAlias);
  if (!user) {
    throw new Error('unauthorized: invalid alias or password');
  }
  const hash = await authDao.getPasswordHashForUser(requestedAlias);
  if (!hash) {
    throw new Error('unauthorized: invalid alias or password');
  }
  const passwordMatches = await bcrypt.compare(password, hash);
  if (!passwordMatches) {
    throw new Error('unauthorized: invalid alias or password');
  }
  const token = (await authDao.createSession(user.alias)).token;
  return new AuthResponse(true, null, token, user.alias);
};

type RegisterRequestWithImage = RegisterRequest & {
  imageBytesBase64: string;
  imageType: string;
};

export const registerHandler = async (event: any): Promise<any> => {
  const req: RegisterRequestWithImage =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const { firstName, lastName, alias, password, imageBytesBase64, imageType } = req;
  const factory = createRuntimeDaoFactory();
  const userDao = factory.createUserDao();
  const authDao = factory.createAuthDao();
  const s3Dao = factory.createS3Dao();

  const hash = await bcrypt.hash(password, 10);
  const bytes = Uint8Array.from(Buffer.from(imageBytesBase64, 'base64'));
  const imageUrl = await s3Dao.uploadProfileImage(alias, bytes, imageType);

  const user = new User(firstName, lastName, alias, imageUrl);
  const created = await userDao.createUser(user, hash);
  if (!created) {
    return new AuthResponse(false, 'User already exists', null, null);
  }
  const token = (await authDao.createSession(alias)).token;
  return new AuthResponse(true, null, token, alias);
};

export const logoutHandler = async (event: any): Promise<any> => {
  const req: LogoutRequest =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const factory = createRuntimeDaoFactory();
  const authDao = factory.createAuthDao();
  if (req?.authToken) {
    await authDao.deleteSession(req.authToken);
  }
  return new AuthResponse(true, null, null, null);
};

export const postStatusHandler = async (event: any): Promise<any> => {
  const req: PostStatusRequest =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const factory = createRuntimeDaoFactory();
  const service = new StatusService(factory);
  const ok = await service.postStatus(req.authToken, req.post);
  return new PostStatusResponse(ok, ok ? null : 'Failed to post status');
};

export const getUserHandler = async (event: any): Promise<any> => {
  const req =
    typeof event === 'string' ? JSON.parse(event) : event?.body ? JSON.parse(event.body) : event;
  const requestedAlias: string = (req?.alias ?? '').trim();
  const factory = createRuntimeDaoFactory();
  const userService = new UserService(factory);
  let user = requestedAlias ? await userService.getUser(requestedAlias) : null;
  if (!user) {
    // Default to first fake user for M3 when alias is empty/unknown
    const fallback = await factory.createUserDao().getFirstUser();
    if (fallback) {
      return {
        success: true,
        message: null,
        user: {
          firstName: fallback.firstName,
          lastName: fallback.lastName,
          alias: fallback.alias,
          imageUrl: fallback.imageUrl,
        },
      };
    }
    return { success: false, message: 'User not found' };
  }
  return {
    success: true,
    message: null,
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      alias: user.alias,
      imageUrl: user.imageUrl,
    },
  };
};
