import { IDaoFactory } from '../interfaces/IDaoFactory';
import { IAuthDao } from '../interfaces/IAuthDao';
import { IUserDao } from '../interfaces/IUserDao';
import { IStatusDao } from '../interfaces/IStatusDao';
import { IFollowDao } from '../interfaces/IFollowDao';
import { IS3Dao } from '../interfaces/IS3Dao';
import { InMemoryAuthDao } from './InMemoryAuthDao';
import { InMemoryUserDao } from './InMemoryUserDao';
import { InMemoryStatusDao } from './InMemoryStatusDao';
import { InMemoryFollowDao } from './InMemoryFollowDao';
import { InMemoryS3Dao } from './InMemoryS3Dao';

export class InMemoryDaoFactory implements IDaoFactory {
  createAuthDao(): IAuthDao {
    return new InMemoryAuthDao();
  }
  createUserDao(): IUserDao {
    return new InMemoryUserDao();
  }
  createStatusDao(): IStatusDao {
    return new InMemoryStatusDao();
  }
  createFollowDao(): IFollowDao {
    return new InMemoryFollowDao();
  }
  createS3Dao(): IS3Dao {
    return new InMemoryS3Dao();
  }
}
