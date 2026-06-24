import { UserProfileResponse } from '../dto/user-profile.response';
import { TokenPair } from '../types/token-pair.type';

/**
 * Result of a successful authentication flow: the public user profile plus the
 * freshly issued token pair.
 */
export interface AuthResult {
  user: UserProfileResponse;
  tokens: TokenPair;
}
