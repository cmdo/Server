import { Token } from "cmdo-inverse";

import { Attributes, Event } from "../Lib/Write/Event";

export type EventStore = {
  /**
   * Add event to a persistent data store.
   *
   * @param attributes - Event attributes.
   */
  commit(attributes: Attributes): Promise<void>;

  /**
   * Mutate event in persistent data store. This is used for GDPR requests
   * to remove personal user data.
   *
   * @param id         - Event id as stored in the stream.
   * @param attributes - Event attributes to mutate.
   */
  mutate(id: string, attributes: Attributes): Promise<void>;

  /**
   * Get all events in order of creation for the provided event stream.
   *
   * @param stream - Event stream.
   *
   * @returns event stream
   */
  stream(stream: string): Promise<Event[]>;
};

export type EventStoreToken = Token<{ new (): EventStore }, EventStore>;
