/**
 * Minimal shape of a Multer in-memory file. Declared locally so the module does
 * not depend on @types/multer; FileInterceptor populates these fields at runtime.
 */
export interface UploadedImage {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}
