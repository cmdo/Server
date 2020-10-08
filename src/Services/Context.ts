import { Token } from "cmdo-inverse";
import Redis from "ioredis";

import { Mongo } from "../Database/Mongo";

export type Context = {
  mongo: Mongo;
  redis: Redis.Redis;
};

export type ContextToken = Token<{ new (): Context }, Context>;
