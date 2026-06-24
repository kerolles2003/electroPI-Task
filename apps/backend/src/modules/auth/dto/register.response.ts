import { ApiProperty } from '@nestjs/swagger';

import { UserProfileResponse } from './user-profile.response';

export class RegisterResponse {
  @ApiProperty({ example: 'Account created. Please check your email for the 4-digit verification code.' })
  message!: string;

  @ApiProperty({ type: () => UserProfileResponse })
  user!: UserProfileResponse;
}
