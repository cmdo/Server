import { Token } from "cmdo-inverse";

import type { Session } from "../Lib/Auth";

export type AuthStore = {
  /**
   * Authenticate provided credentials and return an authentication token.
   *
   * @param key      - Key identifier, eg. email, username
   * @param password - Password to authenticate.
   *
   * @returns Token
   */
  authenticate(key: string, password: string): Promise<Session>;

  /**
   * Retrieve auditor id from given token.
   *
   * @param token - Token to resolve.
   *
   * @returns Session
   */
  resolve(token: string): Promise<Session>;

  /**
   * Destroy a session.
   *
   * @param token - Token to destroy.
   */
  destroy(token: string): Promise<void>;
};

export type AuthStoreToken = Token<{ new (): AuthStore }, AuthStore>;
