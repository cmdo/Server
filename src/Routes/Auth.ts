import { HttpSuccess, Route, router } from "cmdo-http";

/**
 * Register auth routes.
 */
export function register(): void {
  router.register([
    new Route({
      method: "post",
      path: "/auth",
      async handler({ auth, body }) {
        await auth.authenticate(body.email, body.password);
        return new HttpSuccess(auth.toJSON());
      }
    }),
    new Route({
      method: "get",
      path: "/auth",
      async handler({ auth }) {
        return new HttpSuccess(auth.toJSON());
      }
    }),
    new Route({
      method: "delete",
      path: "/auth",
      async handler({ auth }) {
        await auth.destroy();
        return new HttpSuccess();
      }
    })
  ]);
}
