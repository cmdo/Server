import { EventEmitter } from "../../Utils";
import { Event } from "./Event";

/*
 |--------------------------------------------------------------------------------
 | Sagas
 |--------------------------------------------------------------------------------
 */

class Sagas extends EventEmitter {
  /**
   * Registers a new event listener.
   *
   * @param event - Event to process.
   * @param fn    - Projection handler.
   */
  public register<E = any>(event: Event, fn: Saga<E>): void {
    this.on(event.type, fn);
  }

  /**
   * Process the event to all listeners.
   *
   * @param event - Event trigger the saga.
   */
  public process(event: Event): void {
    this.emit(event.type, event);
  }
}

export const sagas = new Sagas();

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

/**
 * Project event to write resources.
 *
 * @param event - Event to project.
 */
type Saga<E = any> = (event: E) => Promise<void>;
