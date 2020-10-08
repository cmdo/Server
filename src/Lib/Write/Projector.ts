import { container } from "../../Container";
import type { Context } from "../../Services/Context";
import type { Event } from "./Event";

export const projections: Map<string, Projector> = new Map();

/*
 |--------------------------------------------------------------------------------
 | Projection
 |--------------------------------------------------------------------------------
 */

export class Projection {
  public readonly event: Event;
  public readonly projector?: Projector;

  public readonly context = container.resolve("Context");

  /**
   * Create a new Projection instance.
   *
   * @param event - Event to project.
   */
  constructor(event: Event) {
    this.event = event;
    this.projector = projections.get(event.type);
  }

  /**
   * Emit the projection.
   */
  public async emit(): Promise<void> {
    if (this.projector) {
      try {
        this.projector.call(this.context, this.event);
      } catch (error) {
        console.error(`Failed to emit projection for '${this.event.type}' event.`, error);
      }
    }
  }
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

/**
 * Project event to read resources.
 *
 * @param event - Event to project.
 */
type Projector<E = any> = (this: Context, event: E) => Promise<void>;
