import { Event } from "./Event";

export const events: Map<string, EventHandler> = new Map();

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type EventHandler<State = any> = (state: State, event: Event) => State;
