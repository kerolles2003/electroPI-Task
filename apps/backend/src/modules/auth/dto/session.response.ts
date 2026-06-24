import { ApiProperty } from '@nestjs/swagger';

export class SessionResponse {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k', description: 'Unique session ID. Use this to revoke a specific device via DELETE /auth/sessions/:sessionId' })
  id!: string;

  @ApiProperty({ example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', nullable: true, description: 'Browser / client user-agent string, if available' })
  userAgent!: string | null;

  @ApiProperty({ example: '192.168.1.1', nullable: true, description: 'IP address of the client that created this session, if available' })
  ipAddress!: string | null;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z', description: 'When the refresh token for this session expires' })
  expiresAt!: Date;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z', description: 'When this session was created' })
  createdAt!: Date;
}
