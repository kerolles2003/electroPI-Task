import { BadRequestException } from '@nestjs/common';

export class InvalidImageFileException extends BadRequestException {
  constructor() {
    super('Uploaded file must be an image');
  }
}
