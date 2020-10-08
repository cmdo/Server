import { HttpError } from "cmdo-http";

import { container } from "../Container";
import { Registrar } from "../Services/Registrar";

export class RegistrarProvider implements Registrar {
  /**
   * Create a new RegistrarStore instance.
   *
   * @param context - Server context.
   */
  constructor(public context = container.resolve("Context")) {}

  /**
   * Attempt to register a unique key value pair with the registrar.
   *
   * @param key - Pair key.
   * @param value - Pair value.
   */
  public async register(key: string, value: string): Promise<void> {
    const added = await this.context.redis.sadd(`registrar:${key}`, value);
    if (!added) {
      throw new HttpError(400, `Registrar key value pair already exists.`, { key, value });
    }
  }

  /**
   * Removes a key value pair from the registrar.
   *
   * @param key - Pair key.
   * @param value - Pair value.
   */
  public async release(key: string, value: string): Promise<void> {
    await this.context.redis.srem(`registrar:${key}`, value);
  }
}
