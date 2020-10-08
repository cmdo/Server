import { MongoClient } from "mongodb";

import { EventEmitter } from "../Utils";

export class Mongo extends EventEmitter {
  public name: string;
  public client: MongoClient;

  /**
   * Create a new mongodb node.
   *
   * @param name - Database name to run queries against.
   * @param uri  - Database connection endpoint.
   */
  constructor(name: string, uri: string) {
    super();
    this.name = name;
    this.client = new MongoClient(uri, {
      poolSize: 10,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ignoreUndefined: false
    });
  }

  /**
   * Connects the mongodb client to the server and keeps it alive.
   *
   * @returns mongodb instance
   */
  public async connect() {
    await this.client.connect();

    // ### Connect Actions

    this.emit("connected");
    this.watch();

    // ### Close Event

    this.client.on("close", () => {
      this.emit("disconnected");
      this.connect();
    });
  }

  /**
   * Get database instance.
   *
   * @param name - Name of the database.
   *
   * @returns database
   */
  public get db() {
    return this.client.db(this.name);
  }

  /**
   * Get a mongodb collection to perform query operations on.
   *
   * @param name - Name of the collection.
   *
   * @returns mongodb collection
   */
  public collection<T = any>(name: string) {
    return this.db.collection<T>(name);
  }

  /**
   * Start watching for changes to data and inform any listeners
   * of changes occurred.
   */
  private watch() {
    const cursor = (this.db as any).watch({ fullDocument: "updateLookup" });
    cursor.on("change", (event: any) => {
      this.emit("change", event);
    });
  }
}
