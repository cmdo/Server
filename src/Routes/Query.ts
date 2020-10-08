import { HttpError, HttpSuccess, Route, router } from "cmdo-http";

import { Query } from "../Lib/Read/Query";

/**
 * Register query routes.
 */
export function register(options: Options = { global: {} }): void {
  router.register([
    new Route({
      method: "post",
      path: "/query",
      async handler({ auth, body }) {
        const target = body.target;
        const isPublic = options.global[target];

        console.log(auth);

        // ### Security Check
        // If the target resource is not public we perform a full authentication
        // and access control check on the requested target resource.

        if (!isPublic) {
          if (!auth.isAuthenticated()) {
            return new HttpError(401, "Unauthorized");
          }

          // ### Tenant
          // Check that a valid tenant is present on the request body.

          const tenant = body.tenant;
          if (!tenant) {
            return new HttpError(500, "Internal server error", {
              target,
              cause: "Missing required tenant acid"
            });
          }

          // ### Permissions
          // Check the clients read permissions under the provided tenant.

          const permission = auth.access.get(tenant).can("read", target);
          if (!permission.granted) {
            return new HttpError(403, "Forbidden");
          }
        }

        // ### Fetch Data

        const data = await new Query(body).data();

        // ### Filter Data

        if (auth.isAuthenticated()) {
          for (const key in data) {
            // filter key resource ...
          }
        }

        // ### Response

        return new HttpSuccess(data);
      }
    })
  ]);
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Options = {
  /**
   * Hashmap of resources that does not require any access control.
   */
  global: {
    [target: string]: boolean;
  };
};
