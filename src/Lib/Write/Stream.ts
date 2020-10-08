import { Attributes, Event } from "./Event";
import { events } from "./Events";

/**
 * Retrieve state for the provided stream id.
 *
 * @param id - Stream id.
 *
 * @returns State
 */
export async function getState<State extends BaseState>(id: string, isGenesis = false): Promise<State> {
  const events = await Event.stream(id);

  // ### Genesis Check
  // On genesis state retrieval we need to ensure that the requested stream
  // does not already exist.

  if (isGenesis) {
    if (events.length) {
      throw new Error(`Stream '${id}' already exists, genesis state cannot be created.`);
    }
    return { id } as State;
  }

  // ### Event Folding
  // Fold the event stream into a single current state object.

  if (!events.length) {
    throw new Error(`Stream '${id}' does not exist, if this is a genesis event use create() method.`);
  }

  let state: any = {};
  for (const event of events) {
    state = fold<State>(state, event);
  }
  return state as State;
}

/**
 * Commit provided data to the event stream.
 *
 * @param attributes - Attribute data to commit to the event store.
 */
export async function apply<Data = any>(attributes: Attributes<Data>): Promise<void> {
  const event = new Event({
    type: attributes.type,
    stream: attributes.stream,
    data: attributes.data || {},
    meta: attributes.meta || {}
  });
  await event.commit();
}

/**
 * Folds the event onto the given state.
 *
 * @param state - Current state.
 * @param event - Event to fold onto the aggregate.
 *
 * @returns State
 */
export function fold<State = any>(state: State, event: Event): State {
  const handler = events.get(event.type);
  if (!handler) {
    throw new Error(`Event '${event.type}' does not have a valid event handler, aborting operation.`);
  }
  return handler(state, event);
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type BaseState = {
  id: string;
};
