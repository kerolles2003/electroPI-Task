/**
 * Resolved owner of a cart for a single request. Exactly one field is set:
 * `userId` for an authenticated user, otherwise `guestToken` for an anonymous
 * cart. The controller resolves this from the access token / guest cookie.
 */
export interface CartIdentity {
  userId?: string;
  guestToken?: string;
}
