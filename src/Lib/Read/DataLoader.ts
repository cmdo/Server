import { container } from "../../Container";
import { DataCache } from "./DataCache";

/*

  Data Loader
  ===========

  Loads data into a local per request cache instance so that other services
  can easily extract relational data without having to keep calling the
  database for data.

 */

export class DataLoader {
  public readonly cache: DataCache;

  /**
   * Create a new DataLoader instance.
   */
  constructor(public store = container.resolve("ReadStore")) {
    this.cache = new DataCache();
  }

  /**
   * Resolve data and add it to the data cache.
   *
   * @param target - Collection to fetch data from.
   * @param ids    - List of ids to resolve.
   */
  public async resolve(target: string, ids: string[], copy = false): Promise<void> {
    const left: string[] = [];

    // ### Data
    // Query the cache for the data we want to return from the
    // subscription data request.

    for (const id of ids) {
      const doc = this.cache.get(target, id);
      if (!doc) {
        left.push(id);
      }
    }

    // ### Missing
    // If cache is missing data for our nodes we load the missing
    // ids from the data store.

    if (left.length > 0) {
      const data = await this.store.ids(target, left);
      if (data.length > 0) {
        this.cache.add(target, data);
      }
    }
  }
}
