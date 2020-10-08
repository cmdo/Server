type EventFn = (...args: any[]) => void;

class Event {
  public fn: EventFn;
  public context: any;
  public once: boolean;

  constructor(fn: EventFn, context: any, once = false) {
    this.fn = fn;
    this.context = context;
    this.once = once === true;
  }
}

export class EventEmitter {
  public events: Map<string, Event[]> = new Map();

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns array of registered event names
   */
  public eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Return the number of listeners listening to a given event.
   *
   * @param evt - Event name.
   *
   * @returns Number of listeners.
   */
  public listenerCount(evt: string): number {
    return this.events.get(evt)?.length || 0;
  }

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param evt  - Event name.
   * @param args - Arguments to pass to the listener.
   *
   * @returns EventEmitter
   */
  public emit(evt: string, ...args: any[]): this {
    this.events.get(evt)?.forEach(event => {
      event.fn.call(event.context, ...args);
      if (event.once) {
        this.removeEventListener(evt, event.fn);
      }
    });
    return this;
  }

  /**
   * Add a listener for a given event.
   *
   * @param evt     - Event name.
   * @param fn      - Listener function.
   * @param context - Context to invoke the listener with.
   *
   * @returns EventEmitter
   */
  public on(evt: string, fn: EventFn, context?: any): this {
    this.addEventListener(evt, fn, context);
    return this;
  }

  public listeners(evt: string) {
    return this.events.get(evt);
  }

  /**
   * Add a one-time listener for a given event.
   *
   * @param evt     - Event name.
   * @param fn      - Listener function.
   * @param context - Context to invoke the listener with.
   *
   * @returns EventEmitter
   */
  public once(evt: string, fn: EventFn, context?: any): this {
    this.addEventListener(evt, fn, context, true);
    return this;
  }

  /**
   * Remove event listener.
   *
   * @param evt     - Event name.
   * @param fn      - Only remove the listeners that match this function.
   * @param context - Only remove the listeners that have this context.
   * @param once    - Only remove one-time listeners.
   *
   * @returns EventEmitter
   */
  public off(evt: string, fn: EventFn, context?: any, once = false): this {
    this.removeEventListener(evt, fn, context, once);
    return this;
  }

  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param evt - Event name.
   *
   * @returns EventEmitter
   */
  public removeAllListeners(evt: string): this {
    this.events.delete(evt);
    return this;
  }

  /**
   * Add a listener for a given event.
   *
   * @param evt     - Event name.
   * @param fn      - Listener function.
   * @param context - Context to invoke the listener with.
   * @param once    - Specify if the listener is a one-time listener.
   *
   * @returns EventEmitter
   */
  private addEventListener(evt: string, fn: EventFn, context: any, once: boolean = false): this {
    if (!this.events.has(evt)) {
      this.events.set(evt, []);
    }
    this.events.get(evt)?.push(new Event(fn, context, once));
    return this;
  }

  /**
   * Remove the listeners of a given event.
   *
   * @param evt     - Event name.
   * @param fn      - Only remove the listeners that match this function.
   * @param context - Only remove the listeners that have this context.
   * @param once    - Only remove one-time listeners.
   *
   * @returns EventEmitter
   */
  private removeEventListener(evt: string, fn: EventFn, context?: any, once = false): this {
    let events = this.events.get(evt);
    if (events) {
      events = events.reduce<Event[]>((events, event) => {
        if (event.fn !== fn || event.context !== context || event.once !== once) {
          events.push(event);
        }
        return events;
      }, []);
      if (events.length === 0) {
        this.events.delete(evt);
      }
    }
    return this;
  }
}

/**
 * Delays a promise by x milliseconds.
 *
 * @param ms - Amount of milliseconds to delay.
 */
export async function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve: any) => {
    setTimeout(resolve, ms);
  });
}
