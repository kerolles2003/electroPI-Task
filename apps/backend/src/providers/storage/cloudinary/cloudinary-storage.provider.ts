import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';

import { StorageProvider } from '../interfaces/storage-provider.interface';

interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Cloudinary-backed object storage. Talks to Cloudinary's signed REST upload API
 * directly via the runtime `fetch`/`FormData`/`Blob` globals and `node:crypto`
 * for the signature, so no vendor SDK dependency is required.
 *
 * Credentials are resolved lazily (per request) rather than at construction:
 * they are optional at boot (see env.validation) and only this active provider
 * requires them, so a misconfiguration surfaces as a clear runtime error.
 */
@Injectable()
export class CloudinaryStorageProvider implements StorageProvider {
  constructor(private readonly config: ConfigService) {}

  async upload(key: string, data: Buffer): Promise<string> {
    const { cloudName, apiKey, apiSecret } = this.credentials();
    const timestamp = Math.floor(Date.now() / 1000);

    // `overwrite=true` makes re-uploading the same public_id idempotent.
    const signature = this.sign(
      { overwrite: 'true', public_id: key, timestamp: String(timestamp) },
      apiSecret,
    );

    const form = new FormData();
    // Copy into an ArrayBuffer-backed view so the Blob part type is satisfied.
    form.append('file', new Blob([new Uint8Array(data)]));
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('public_id', key);
    form.append('overwrite', 'true');
    form.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: form },
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new InternalServerErrorException(`Cloudinary upload failed (${response.status}): ${detail}`);
    }

    const body = (await response.json()) as { secure_url?: string };
    if (!body.secure_url) {
      throw new InternalServerErrorException('Cloudinary upload returned no URL');
    }

    return body.secure_url;
  }

  async delete(key: string): Promise<void> {
    const { cloudName, apiKey, apiSecret } = this.credentials();
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = this.sign({ public_id: key, timestamp: String(timestamp) }, apiSecret);

    const form = new FormData();
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('public_id', key);
    form.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      { method: 'POST', body: form },
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new InternalServerErrorException(`Cloudinary delete failed (${response.status}): ${detail}`);
    }
  }

  private credentials(): CloudinaryCredentials {
    return {
      cloudName: this.config.getOrThrow<string>('storage.cloudinary.cloudName'),
      apiKey: this.config.getOrThrow<string>('storage.cloudinary.apiKey'),
      apiSecret: this.config.getOrThrow<string>('storage.cloudinary.apiSecret'),
    };
  }

  /**
   * Builds Cloudinary's upload signature: SHA-1 of the signed params (sorted,
   * `key=value` joined by `&`) concatenated with the API secret.
   */
  private sign(params: Record<string, string>, apiSecret: string): string {
    const toSign = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    return createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');
  }
}
