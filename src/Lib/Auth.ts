import { AccessControl } from "cmdo-access";

import { container } from "../Container";

/*
 |--------------------------------------------------------------------------------
 | Overrides
 |--------------------------------------------------------------------------------
 */

declare module "http" {
  interface IncomingMessage {
    auth: Auth;
  }
}

/*
 |--------------------------------------------------------------------------------
 | Auth
 |--------------------------------------------------------------------------------
 */

export class Auth {
  public token: string;
  public expires: number;
  public auditor: string;
  public access: AccessControl;

  constructor(public store = container.resolve("AuthStore")) {
    this.token = "";
    this.expires = 0;
    this.auditor = "";
    this.access = new AccessControl("");
  }

  /**
   * Check if the auth instance has been authenticated.
   *
   * @returns Boolean
   */
  public isAuthenticated(): boolean {
    return this.token === "" ? false : true;
  }

  /**
   * Authenticate provided credentials and return an authentication token.
   *
   * @param email    - Email address to authenticate.
   * @param password - Password to authenticate.
   *
   * @returns Token
   */
  public async authenticate(email: string, password: string): Promise<void> {
    await this.set(await this.store.authenticate(email, password));
  }

  /**
   * Resolve authentication instance for provided token.
   *
   * @param token - Token to resolve.
   */
  public async resolve(token: string): Promise<void> {
    await this.set(await this.store.resolve(token));
  }

  /**
   * Destroy a session.
   */
  public async destroy(): Promise<void> {
    await this.store.destroy(this.token);
  }

  /**
   * Retrieve JSON representation of the auth session.
   *
   * @returns JSON
   */
  public toJSON(): Session & { grants: any } {
    return {
      token: this.token,
      expires: this.expires,
      auditor: this.auditor,
      grants: this.access.toJSON()
    };
  }

  /**
   * Set session on the auth instance.
   *
   * @param session - Auth session.
   */
  private async set(session: Session): Promise<void> {
    console.log("Set session: ", session);
    this.token = session.token;
    this.expires = session.expires;
    this.auditor = session.auditor;
    this.access = await AccessControl.for(session.auditor);
  }
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Session = {
  token: string;
  expires: number;
  auditor: string;
};
