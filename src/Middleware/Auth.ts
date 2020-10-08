import { Middleware } from "cmdo-http";
import { IncomingMessage, ServerResponse } from "http";

import { Auth } from "../Lib/Auth";

export function auth(): Middleware {
  return async (req: IncomingMessage, res: ServerResponse) => {
    req.auth = new Auth();

    if (req.headers.authorization) {
      const [type, token] = req.headers.authorization.split(" ");
      switch (type) {
        case "Bearer": {
          try {
            await req.auth.resolve(token);
          } catch (error) {
            res.statusCode = error.code;
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify(error));
            res.end();
          }
          break;
        }
      }
    }
  };
}
