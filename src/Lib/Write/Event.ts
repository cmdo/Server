import { container } from "../../Container";
import { Projection } from "./Projector";
import { sagas } from "./Sagas";

export class Event<Data = any> {
  public readonly type: string;
  public readonly stream: string;
  public readonly data: Data;
  public readonly meta: Meta;

  /**
   * Create new Event instance.
   *
   * @param attributes - Event data.
   */
  constructor(attributes: Attributes<Data>, public store = container.resolve("EventStore")) {
    this.type = attributes.type;
    this.stream = attributes.stream;
    this.data = attributes.data;
    this.meta = {
      auditor: attributes.meta.auditor,
      created: attributes.meta.created || Math.floor(Date.now() / 1000),
      deleted: typeof attributes.meta.deleted !== "number" ? false : attributes.meta.deleted
    };
  }

  /**
   * Returns all docs in order of events for the provided event stream id.
   *
   * @param id - Event stream id.
   *
   * @returns an array of Events
   */
  public static async stream(id: string): Promise<Event[]> {
    return container.resolve("EventStore").stream(id);
  }

  /**
   * Store the event with the platform data stores.
   *
   * @param isRehydrating - Is the commit part of rehydration operations?
   */
  public async commit(isRehydrating = false): Promise<void> {
    await this.store.commit(this.toJSON());
    new Projection(this).emit();
    if (!isRehydrating) {
      sagas.process(this);
    }
  }

  /**
   * GDRP mutation function, used for removing personal data from the event.
   *
   * @param id - Event id to mutate.
   */
  public async mutate(id: string): Promise<void> {
    await this.store.mutate(id, this.toJSON());
    new Projection(this).emit();
  }

  /**
   * Get event as a JSON object.
   *
   * @returns event json
   */
  public toJSON(): Attributes<Data> {
    return {
      type: this.type,
      stream: this.stream,
      data: this.data,
      meta: this.meta
    };
  }
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Attributes<Data = any> = {
  /**
   * Event type identifier written in past tense pascal case.
   * Eg. FooCreated
   */
  type: string;

  /**
   * Event stream identifier.
   */
  stream: string;

  /**
   * Event stream data object.
   */
  data: Data;

  /**
   * Event stream meta object.
   */
  meta: Meta;
};

export type Meta = {
  /**
   * Creator of the event, if this is an impersonated event make sure to add
   * the impersonated entity id here. And the admin id to the impersonator
   * meta key of this event.
   */
  auditor: string;

  /**
   * Event impersonator key is used for tracking the administrator creating the
   * event on behalf of a another entity.
   */
  impersonator?: string;

  /**
   * UNIX timestamp of when the event was created. This value is also used for
   * sorting the event stream. Defaults to the time of creation if not manually
   * provided.
   */
  created?: number;

  /**
   * Check if the event stream is deleted.
   */
  deleted?: false | "deleted" | "destroyed";
};
