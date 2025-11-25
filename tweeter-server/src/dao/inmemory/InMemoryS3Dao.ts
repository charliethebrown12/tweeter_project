import { IS3Dao } from '../interfaces/IS3Dao';

export class InMemoryS3Dao implements IS3Dao {
  public async uploadProfileImage(alias: string, imageBytes: Uint8Array, contentType: string): Promise<string> {
    // For now return a fake URL that matches existing client expectations.
    return `https://example.com/profiles/${alias}.png`;
  }
}
