import { HttpError, HttpSuccess, Route, router } from "cmdo-http";
import { ObjectId } from "mongodb";

import { commands } from "../Lib/Write/Commands";

/**
 * Register command routes.
 */
export function register(): void {
  router.register([
    new Route({
      method: "post",
      path: "/commands",
      async handler({ body }) {
        const command = commands.get(body.type);
        if (!command) {
          return new HttpError(404, "Command does not exist, or has been removed.", { type: body.type });
        }
        await command.resolve({
          ...body,
          stream: body.stream || new ObjectId().toHexString()
        });
        return new HttpSuccess();
      }
    })
  ]);
}
