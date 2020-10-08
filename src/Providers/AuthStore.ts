import bcrypt from "bcrypt";
import { HttpError } from "cmdo-http";
import { Collection } from "mongodb";
import { nanoid } from "nanoid";

import { container } from "../Container";
import type { Session } from "../Lib/Auth";
import { AuthStore } from "../Services/AuthStore";

const ONE_YEAR = 1000 * 60 * 60 * 24 * 30 * 12;

export class AuthStoreProvider implements AuthStore {
  /**
   * Create a new AuthStore instance.
   *
   * @param context - Server context.
   */
  constructor(public context = container.resolve("Context")) {}

  /**
   * MongoDb Accounts collection.
   */
  public get collection(): Collection {
    return this.context.mongo.collection("Accounts");
  }

  /**
   * Authenticate provided credentials and return an authentication token.
   *
   * @param email    - Account email.
   * @param password - Account password.
   *
   * @returns Token
   */
  public async authenticate(email: string, password: string): Promise<Session> {
    const account = await this.collection.findOne({ email });
    if (!account || !(await bcrypt.compare(password, account.password))) {
      throw new HttpError(404, "Invalid email, and/or password.");
    }

    const token = nanoid(32);
    const expires = Math.floor(new Date().getTime() + ONE_YEAR);

    await this.collection.updateOne(
      { id: account.id },
      {
        $push: {
          sessions: {
            token,
            expires
          }
        }
      }
    );

    return { token, expires, auditor: account.id };
  }

  /**
   * Retrieve auditor id from given token.
   *
   * @param token - Token to resolve.
   *
   * @returns Auditor id
   */
  public async resolve(token: string): Promise<Session> {
    const account = await this.collection.findOne({ "sessions.token": token });
    if (!account) {
      throw new HttpError(401, "Unauthorized");
    }
    return { token, expires: account.sessions.find((session: any) => session.token === token).expires, auditor: account.id };
  }

  /**
   * Destroy a session.
   *
   * @param token - Token to destroy.
   */
  public async destroy(token: string): Promise<void> {
    await this.collection.updateOne(
      { "sessions.token": token },
      {
        $pull: {
          sessions: {
            token
          }
        }
      }
    );
  }
}
