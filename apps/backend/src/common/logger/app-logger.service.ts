import { ConsoleLogger, Injectable } from '@nestjs/common';

/**
 * Placeholder application logger.
 * Defaults to Nest's ConsoleLogger; swap for a structured logger
 * (e.g. pino) in a later phase without touching call sites.
 */
@Injectable()
export class AppLogger extends ConsoleLogger {}
