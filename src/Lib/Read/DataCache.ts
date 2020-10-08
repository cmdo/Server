export type DataCacheJSON = {
  [target: string]: any[];
};

/*

  Data Cache
  ==========

  Designed to cache data per incoming query request. Mainly beneficial when doing
  deep nested relational queries.

 */

export class DataCache {
  public targets: Map<string, Map<string, any>> = new Map();

  /**
   * Add provided documents to the cache.
   *
   * @param target - Target table/collection the docs should be cached under.
   * @param docs   - Documents to cache.
   */
  public add(target: string, docs: any[]): void {
    let store = this.targets.get(target);
    if (!store) {
      store = this.targets.set(target, new Map()).get(target)!;
    }
    for (const doc of docs) {
      store.set(doc.id, Object.freeze(doc));
    }
  }

  /**
   * Retrieve document from cache.
   *
   * @param target - Target table/collection the doc is cached under.
   * @param id     - Document id.
   * @param copy   - Produce a mutable copy of the doc.
   *
   * @returns Document
   */
  public get(target: string, id: string, copy = false): any {
    const store = this.targets.get(target);
    if (store) {
      return store.get(id);
    }
  }

  /**
   * Flushe the cache.
   */
  public flush(): void {
    this.targets = new Map();
  }

  /**
   * Retrieve cached data as a JSON object.
   *
   * @returns Cached data
   */
  public toJSON(): DataCacheJSON {
    const result: DataCacheJSON = {};
    this.targets.forEach((value, key) => {
      result[key] = Array.from(value.values());
    });
    return result;
  }
}
