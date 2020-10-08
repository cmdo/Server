import { HttpError } from "cmdo-http";

import { container } from "../../Container";
import { Policy, response } from "./CommandPolicy";
import { apply, BaseState, getState } from "./Stream";

export class Command<State extends BaseState = any, Data = any> {
  public readonly type: string;
  public readonly genesis: boolean;
  public readonly reserve?: string[];
  public readonly policies: Policy<Data>[];
  public readonly handler: Handler<State & Actions, Data>;

  /**
   * Creates a new Command instance.
   *
   * @param options - Command options.
   */
  constructor(
    options: Options<State, Data>,
    public bus = container.resolve("Bus"),
    public registrar = container.resolve("Registrar")
  ) {
    this.type = options.type;
    this.genesis = options.genesis === true;
    this.reserve = options.reserve;
    this.policies = options.policies || [];
    this.handler = options.handler;
  }

  /**
   * Resolve the command with the given stream id.
   *
   * @param req - Command request body.
   */
  public async resolve(req: Request<Data>): Promise<void> {
    const reserved: string[] = [];

    // ### Policies

    for (const policy of this.policies) {
      const res = await policy.call(response, req);
      if (res.status === "rejected") {
        throw new HttpError(res.code, res.message, res.data);
      }
    }

    // ### Registrar Reservation
    // A command can attempt to reserve incoming values as unique entries blocking other
    // commands from using the same values in the specified keys.

    if (this.reserve) {
      try {
        for (const key of this.reserve) {
          const value: string | undefined = (req.data as any)[key];
          if (!value) {
            throw new HttpError(400, "Missing required reservation key in data object.", { key });
          }
          await this.registrar.register(key, value);
          reserved.push(key);
        }
      } catch (error) {
        this.handleError(req.data, reserved);
        throw error;
      }
    }

    // ### Process Command

    await this.bus.queue(`command:${req.stream}`, async () => {
      const state = await getState<State>(req.stream, this.genesis);
      try {
        await this.handler.call(
          {
            ...state,
            apply
          },
          req.data
        );
      } catch (error) {
        this.handleError(req.data, reserved);
        throw error;
      }
    });
  }

  /**
   * Handle error.
   *
   * @param data     - Request data.
   * @param reserved - Reserved keys to release.
   */
  public handleError(data: any, reserved: any[]) {
    for (const key of reserved) {
      this.registrar.release(key, data[key]);
    }
  }
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

/**
 * Options that can be passed onto a command instance.
 */
export type Options<State extends BaseState, Data> = {
  type: string;
  genesis?: boolean;
  policies?: Policy<Data>[];
  reserve?: string[];
  handler: Handler<State & Actions, Data>;
};

/**
 * Aggregate command handler.
 *
 * @param body - Body provided by the request.
 */
export type Handler<State extends Actions, Data> = (this: State, data: Data) => Promise<void>;

/**
 * Actions made available to the command handler context.
 */
export type Actions = {
  apply: typeof apply;
};

/**
 * Command provided by incoming requests.
 */
export type Request<Data = any> = {
  type: string;
  stream: string;
  data: Data;
};
