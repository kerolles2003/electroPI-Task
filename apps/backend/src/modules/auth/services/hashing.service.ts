import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt } from 'crypto';

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

  /** Returns a cryptographically random hex string of `byteLength * 2` chars. */
  generateToken(byteLength = 32): string {
    return randomBytes(byteLength).toString('hex');
  }

  /** Returns a cryptographically random 4-digit OTP string (1000–9999). */
  generateOtp(): string {
    return randomInt(1000, 10000).toString();
  }

  /** SHA-256 hex digest — used to index single-use tokens (verification, reset). */
  sha256(value: string): string {
    return this.digest(value);
  }

  private digest(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
