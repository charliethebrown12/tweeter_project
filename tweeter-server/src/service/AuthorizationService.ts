import { AuthToken } from "tweeter-shared";
import { IDaoFactory } from "../dao/interfaces/IDaoFactory";
import { Service } from "./Service";

export class AuthorizationService implements Service {
  constructor(private readonly daoFactory: IDaoFactory) {}

  public async authorize(auth: AuthToken | string | null | undefined): Promise<string> {
    const token =
      typeof auth === 'string'
        ? auth
        : auth?.token ?? null; // handles AuthToken | null | undefined

    if (!token) {
      throw new Error('unauthorized: missing auth token');
    }

    const authDao = this.daoFactory.createAuthDao();

    const isValid = await authDao.validateToken(token);
    if (!isValid) {
      throw new Error('unauthorized: invalid or expired auth token');
    }

    const alias = await authDao.getAliasForToken(token);
    if (!alias) {
      throw new Error('unauthorized: session not found');
    }

    return alias;
  }
}

