export interface IS3Dao {
  uploadProfileImage(alias: string, imageBytes: Uint8Array, contentType: string): Promise<string>; // returns public URL
}
