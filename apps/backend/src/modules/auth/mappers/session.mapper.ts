import { Session } from '@prisma/client';

import { SessionResponse } from '../dto/session.response';

export class SessionMapper {
  static toResponse(session: Session): SessionResponse {
    return {
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    };
  }
}
