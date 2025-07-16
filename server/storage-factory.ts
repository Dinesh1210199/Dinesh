import { IStorage } from './storage';
import { MemStorage } from './storage';
import { CSVStorage } from './csv-storage';

export type StorageType = 'memory' | 'csv' | 'postgres';

export function createStorage(type: StorageType = 'csv'): IStorage {
  switch (type) {
    case 'memory':
      return new MemStorage();
    case 'csv':
      return new CSVStorage('./data');
    case 'postgres':
      // Future implementation for PostgreSQL
      throw new Error('PostgreSQL storage not yet implemented');
    default:
      throw new Error(`Unknown storage type: ${type}`);
  }
}

// Environment variable to control storage type
const STORAGE_TYPE = (process.env.STORAGE_TYPE as StorageType) || 'csv';

// Export configured storage instance
export const storage = createStorage(STORAGE_TYPE);

console.log(`Using ${STORAGE_TYPE} storage`);