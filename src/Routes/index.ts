import { register as auth } from "./Auth";
import { register as commands } from "./Command";
import { Options as QueryOptions, register as queries } from "./Query";

export const routes: Routes = {
  auth,
  commands,
  queries
};

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Routes = {
  auth: () => void;
  commands: () => void;
  queries: (options?: QueryOptions) => void;
};
