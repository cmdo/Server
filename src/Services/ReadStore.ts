import { Token } from "cmdo-inverse";

import { QueryOptions } from "../Lib/Read/Query";

export type ReadStore = {
  /**
   * Get data for provided ids.
   *
   * @param target - Target to get ids under.
   * @param ids    - Ids to retrieve from target.
   *
   * @returns docs
   */
  ids(target: string, ids: string[]): Promise<any[]>;

  /**
   * Query data and return a filtered result.
   *
   * @param query - Query to execute against the database.
   *
   * @returns query result
   */
  query(query: QueryOptions): Promise<any>;
};

export type ReadStoreToken = Token<{ new (): ReadStore }, ReadStore>;
