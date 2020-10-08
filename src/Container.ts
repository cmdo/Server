import { Container } from "cmdo-inverse";

import { AuthStoreToken } from "./Services/AuthStore";
import { BusToken } from "./Services/Bus";
import { ContextToken } from "./Services/Context";
import { EventStoreToken } from "./Services/EventStore";
import { ReadStoreToken } from "./Services/ReadStore";
import { RegistrarToken } from "./Services/Registrar";

export const container = new Container<{
  AuthStore: AuthStoreToken;
  Bus: BusToken;
  Context: ContextToken;
  EventStore: EventStoreToken;
  
  ReadStore: ReadStoreToken;
  Registrar: RegistrarToken;
}>();
