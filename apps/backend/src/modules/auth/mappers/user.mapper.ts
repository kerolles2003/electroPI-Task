import { User } from '@prisma/client';

import { UserProfileResponse } from '../dto/user-profile.response';

/**
 * Maps the persisted User entity to its safe public representation.
 */
export class UserMapper {
  static toProfile(user: User): UserProfileResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      preferredLocale: user.preferredLocale,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
