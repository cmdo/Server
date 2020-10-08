import { container } from "../Container";
import { Attributes, Event } from "../Lib/Write/Event";
import { EventStore } from "../Services/EventStore";

export class EventStoreProvider implements EventStore {
  /**
   * Create new EventStore instance.
   *
   * @param context - Server context.
   */
  constructor(public context = container.resolve("Context")) {}

  /**
   * Add event to a persistent data store.
   *
   * @param attributes - Attribute data.
   */
  public async commit(attributes: Attributes) {
    this.context.mongo.db.collection("Events").insertOne(attributes);
  }

  /**
   * Mutate event in persistent data store. This is used for GDPR requests
   * to remove personal user data.
   *
   * @param id         - Event id as stored in the stream.
   * @param attributes - Event data to mutate.
   */
  public async mutate(id: string, attributes: Attributes) {}

  /**
   * Get all events in order of creation for the provided event stream.
   *
   * @param stream - Event stream.
   *
   * @returns event stream
   */
  public async stream(stream: string) {
    const docs = await this.context.mongo.db.collection("Events").find({ stream }).sort({ "meta.created": 1 }).toArray();
    return docs.map(
      (doc: any) =>
        new Event({
          type: doc.type,
          stream: doc.stream,
          data: doc.data,
          meta: doc.meta
        })
    );
  }
}
