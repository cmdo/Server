import { Token } from "cmdo-inverse";

export type Registrar = {
  /**
   * Attempt to register a unique key value pair with the registrar.
   *
   * @param key - Pair key.
   * @param value - Pair value.
   */
  register(key: string, value: string): Promise<void>;

  /**
   * Removes a key value pair from the registrar.
   *
   * @param key - Pair key.
   * @param value - Pair value.
   */
  release(key: string, value: string): Promise<void>;
};

export type RegistrarToken = Token<{ new (): Registrar }, Registrar>;
