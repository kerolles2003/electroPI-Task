/**
 * HTTP-level context passed from controller to service so the service
 * never directly imports the Express Request type.
 */
export interface SessionContext {
  userAgent?: string;
  ipAddress?: string;
}
