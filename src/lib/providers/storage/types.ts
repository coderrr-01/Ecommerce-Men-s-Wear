export interface UploadInput {
  file: Buffer;
  fileName: string;
  mimeType?: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/** Storage boundary. Product images can move off Cloudinary without touching services. */
export interface StorageProvider {
  readonly id: "cloudinary";
  upload(input: UploadInput): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
  getUrl(publicId: string, options?: { width?: number; quality?: "auto" | number }): string;
}
