import { IDaoFactory } from './interfaces/IDaoFactory';
import { InMemoryDaoFactory } from './inmemory/InMemoryDaoFactory';
import { DynamoDaoFactory } from './dynamo/DynamoDaoFactory';

// Placeholder: later we'll add DynamoDaoFactory that implements IDaoFactory
export function createRuntimeDaoFactory(): IDaoFactory {
  // Use environment variable to switch implementations
  const impl = process.env.DAO_IMPL || 'inmemory';
  if (impl === 'inmemory') {
    return new InMemoryDaoFactory();
  }
  if (impl === 'dynamo') {
    return new DynamoDaoFactory();
  }

  // Default fallback
  return new InMemoryDaoFactory();
}
