import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

/**
 * bcrypt wrapper used for both passwords and refresh tokens.
 */
@Injectable()
export class HashingService {
  private readonly rounds: number;

  constructor(config: ConfigService) {
    this.rounds = config.getOrThrow<number>('auth.bcryptRounds');
  }

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  /**
   * Refresh JWTs exceed bcrypt's 72-byte input limit, so digest them first
   * to preserve full entropy before hashing.
   */
  hashToken(token: string): Promise<string> {
    return this.hash(this.digest(token));
  }

  compareToken(token: string, hash: string): Promise<boolean> {
    return this.compare(this.digest(token), hash);
  }

  private digest(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
