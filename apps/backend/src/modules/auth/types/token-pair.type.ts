/**
 * A freshly signed access + refresh JWT pair.
 */
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};
