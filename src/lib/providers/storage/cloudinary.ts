import { createHash } from "node:crypto";
import { ProviderError } from "@/lib/errors";
import type { StorageProvider, UploadInput, UploadResult } from "./types";

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

function sign(params: Record<string, string>, secret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${payload}${secret}`).digest("hex");
}

export class CloudinaryStorageProvider implements StorageProvider {
  readonly id = "cloudinary" as const;

  constructor(private readonly config: CloudinaryConfig) {
    if (!config.cloudName || !config.apiKey || !config.apiSecret) {
      throw new ProviderError("Cloudinary", "credentials are not configured");
    }
  }

  async upload({
    file,
    fileName,
    mimeType = "image/jpeg",
    folder = "products",
  }: UploadInput): Promise<UploadResult> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = sign({ folder, timestamp }, this.config.apiSecret);
    const bytes = file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength,
    ) as ArrayBuffer;

    const form = new FormData();
    form.append("file", new Blob([bytes], { type: mimeType }), fileName);
    form.append("api_key", this.config.apiKey);
    form.append("timestamp", timestamp);
    form.append("folder", folder);
    form.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
      { method: "POST", body: form, cache: "no-store" },
    );

    if (!response.ok) {
      throw new ProviderError("Cloudinary", `upload failed with ${response.status}`);
    }

    const data = (await response.json()) as CloudinaryUploadResponse;
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
    };
  }

  async delete(publicId: string): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = sign({ public_id: publicId, timestamp }, this.config.apiSecret);
    const body = new URLSearchParams({
      public_id: publicId,
      timestamp,
      api_key: this.config.apiKey,
      signature,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/destroy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new ProviderError("Cloudinary", `delete failed with ${response.status}`);
    }
  }

  getUrl(publicId: string, options: { width?: number; quality?: "auto" | number } = {}): string {
    const transforms = ["f_auto", `q_${options.quality ?? "auto"}`];
    if (options.width) transforms.push(`w_${options.width}`, "c_limit");
    return `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${transforms.join(",")}/${publicId}`;
  }
}
