import { IDaoFactory } from '../interfaces/IDaoFactory';
import { IAuthDao } from '../interfaces/IAuthDao';
import { IUserDao } from '../interfaces/IUserDao';
import { IStatusDao } from '../interfaces/IStatusDao';
import { IFollowDao } from '../interfaces/IFollowDao';
import { IS3Dao } from '../interfaces/IS3Dao';
import { DynamoAuthDao } from './DynamoAuthDao';
import { DynamoUserDao } from './DynamoUserDao';
import { DynamoStatusDao } from './DynamoStatusDao';
import { DynamoFollowDao } from './DynamoFollowDao';
import { DynamoS3Dao } from './DynamoS3Dao';

export class DynamoDaoFactory implements IDaoFactory {
  createAuthDao(): IAuthDao { return new DynamoAuthDao(); }
  createUserDao(): IUserDao { return new DynamoUserDao(); }
  createStatusDao(): IStatusDao { return new DynamoStatusDao(); }
  createFollowDao(): IFollowDao { return new DynamoFollowDao(); }
  createS3Dao(): IS3Dao { return new DynamoS3Dao(); }
}
