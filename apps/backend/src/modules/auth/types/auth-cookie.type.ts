/**
 * Cookie-related typings for the auth flow.
 * `AuthCookieName` is the literal union of cookie names the auth module sets.
 */
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../constants/auth.constants';

export type AuthCookieName = typeof ACCESS_TOKEN_COOKIE | typeof REFRESH_TOKEN_COOKIE;
