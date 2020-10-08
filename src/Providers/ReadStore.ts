import { QuerySelector } from "mongodb";

import { container } from "../Container";
import { QueryOptions } from "../Lib/Read/Query";
import { ReadStore } from "../Services/ReadStore";

export class ReadStoreProvider implements ReadStore {
  /**
   * Create new Read instance.
   *
   * @param context - Server context.
   */
  constructor(public context = container.resolve("Context")) {}

  /**
   * Get data for provided ids.
   *
   * @param target - Target to get ids from.
   * @param ids    - Ids to retrieve from target.
   *
   * @returns docs
   */
  public async ids(target: string, ids: string[]): Promise<any[]> {
    return await this.context.mongo
      .collection(target)
      .find({
        id: {
          $in: ids
        }
      })
      .toArray();
  }

  /**
   * Query data and return a filtered result.
   *
   * @param query - Query to execute against the database.
   *
   * @returns query result
   */
  public async query(query: QueryOptions<QuerySelector<any>>): Promise<any> {
    const cursor = this.context.mongo.collection(query.target).find(query.filter);

    // TODO sort, limit, offset

    return cursor.toArray();
  }
}
