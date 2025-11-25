import { IAuthDao } from './IAuthDao';
import { IUserDao } from './IUserDao';
import { IStatusDao } from './IStatusDao';
import { IFollowDao } from './IFollowDao';
import { IS3Dao } from './IS3Dao';

export interface IDaoFactory {
  createAuthDao(): IAuthDao;
  createUserDao(): IUserDao;
  createStatusDao(): IStatusDao;
  createFollowDao(): IFollowDao;
  createS3Dao(): IS3Dao;
}
