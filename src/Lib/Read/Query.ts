import { container } from "../../Container";
import { DataCacheJSON } from "./DataCache";
import { DataLoader } from "./DataLoader";

export class Query {
  public readonly loader: DataLoader;
  public readonly query: QueryOptions;

  /**
   * Create a new Query instance.
   *
   * @param query - Query to use against store.
   */
  constructor(query: QueryOptions, public store = container.resolve("ReadStore")) {
    this.loader = new DataLoader();
    this.query = query;
  }

  /**
   * Get the documents for the subscription.
   *
   * @param auth - Authentication instance performing the query.
   *
   * @returns documents
   */
  public async data(): Promise<DataCacheJSON> {
    const { target, relations } = this.query;

    // ### Get Data

    const data = await this.store.query(this.query);

    // ### Data Loader
    // Add the resolved data to the data loader cache.

    this.loader.cache.add(target, data);

    // ### Relations
    // If the subscription has relational requirements we resolve them here.

    if (relations) {
      await this.relations(data, relations);
    }

    // ### Response

    return this.loader.cache.toJSON();
  }

  /**
   * Resolve relations against the given documents.
   *
   * @param docs      - Documents to resolve relations on.
   * @param relations - Relational schema to resolve relations from.
   */
  public async relations(docs: any[], relations: QueryRelations) {
    for (const key in relations) {
      const target = relations[key].target;
      const ids = getUniqueIds(docs, key);

      if (ids.length > 0) {
        await this.loader.resolve(target, ids);
      }

      const nextRelations = relations[key].relations;
      if (nextRelations) {
        await this.relations(
          ids.map(id => this.loader.cache.get(target, id)),
          nextRelations
        );
      }
    }
  }
}

/*
 |--------------------------------------------------------------------------------
 | Utilties
 |--------------------------------------------------------------------------------
 */

/**
 * Generate a set of unique ids from the given document lists key attribute.
 *
 * @param docs - Documents to traverse.
 * @param key  - Key on the document to extract ids from.
 *
 * @returns unique ids
 */
function getUniqueIds(docs: any[], key: string): string[] {
  const ids = new Set<string>();
  for (const doc of docs) {
    const val = doc[key];
    if (Array.isArray(val)) {
      for (const id of val) {
        ids.add(id);
      }
    } else {
      ids.add(val);
    }
  }
  return Array.from(ids);
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type QueryOptions<QueryFilter = any> = {
  target: string;
  filter: QueryFilter;
  sort?: {
    [key: string]: -1 | 1;
  }[];
  limit?: number;
  offset?: number;
  relations?: QueryRelations;
};

export type QueryResponse = {
  [collection: string]: any[];
};

export type QueryRelations = {
  [attribute: string]: {
    target: string;
    relations?: QueryRelations;
  };
};
