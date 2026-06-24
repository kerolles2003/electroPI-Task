import { ApiProperty } from '@nestjs/swagger';

/**
 * Shape returned by AllExceptionsFilter for every non-2xx response.
 * Use this as the `type` in @ApiBadRequestResponse, @ApiUnauthorizedResponse, etc.
 */
export class ApiErrorResponse {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode!: number;

  @ApiProperty({
    example: 'Email already registered',
    description: 'Human-readable error message. Validation errors return an object with a `message` array.',
  })
  message!: string;

  @ApiProperty({ example: '/auth/register', description: 'Request path that produced the error' })
  path!: string;
}
