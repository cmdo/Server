import type { Request } from "./Command";

/*
 |--------------------------------------------------------------------------------
 | Responses
 |--------------------------------------------------------------------------------
 */

/**
 * Generates a policy accept response.
 *
 * @returns Accept
 */
export function accept(): Accepted {
  return {
    status: "accepted"
  };
}

/**
 * Generates a policy reject response.
 *
 * @param code    - Http response code.
 * @param message - Message detailing the rejection.
 * @param data    - (Optional) Additional rejection data.
 *
 * @returns Reject
 */
export function reject(code: number, message: string, data = {}): Rejected {
  return {
    status: "rejected",
    code,
    message,
    data
  };
}

export const response = { accept, reject };

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Policy<Data> = (this: Response, req: Request<Data>) => Promise<Accepted | Rejected>;

type Response = {
  accept(): Accepted;
  reject(code: number, message: string, data?: any): Rejected;
};

type Accepted = {
  status: "accepted";
};

type Rejected = {
  status: "rejected";
  code: number;
  message: string;
  data: any;
};
