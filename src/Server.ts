import { container as access } from "cmdo-access";
import { cors, route, server } from "cmdo-http";
import Redis from "ioredis";

import { REDIS_DEFAULT_CONFIG } from "./Config/Redis";
import { container } from "./Container";
import { Mongo } from "./Database/Mongo";
import { auth } from "./Middleware/Auth";
import { AccessStoreProvider } from "./Providers/AccessStore";
import { AuthStoreProvider } from "./Providers/AuthStore";
import { BusProvider } from "./Providers/Bus";
import { EventStoreProvider } from "./Providers/EventStore";
import { ReadStoreProvider } from "./Providers/ReadStore";
import { RegistrarProvider } from "./Providers/Registrar";
import { routes } from "./Routes";
import { Context } from "./Services/Context";
import { Bootstrap } from "./Types/Bootstrap";
import { Config } from "./Types/Config";

/*
 |--------------------------------------------------------------------------------
 | Server
 |--------------------------------------------------------------------------------
 */

/**
 * Start server.
 *
 * @param config   - Server configuration.
 * @param bootstrap - Server bootstrap.
 *
 * @returns server context
 */
export async function listen(config: Config, bootstrap?: Bootstrap): Promise<Context> {
  const context: Context = {
    mongo: new Mongo(config.mongo.name, config.mongo.uri),
    redis: new Redis({ ...REDIS_DEFAULT_CONFIG, ...(config.redis || {}) })
  };

  await context.mongo.connect();

  // ### Access Dependencies

  access.singleton("AccessStore", new AccessStoreProvider(context));

  // ### Server Context

  container.singleton("Context", context);

  // ### Server Dependencies

  container
    .singleton("AuthStore", new AuthStoreProvider())
    .singleton("Bus", new BusProvider())
    .singleton("EventStore", new EventStoreProvider())
    .singleton("ReadStore", new ReadStoreProvider())
    .singleton("Registrar", new RegistrarProvider());

  // ### Bootstrap

  if (bootstrap) {
    await bootstrap(context, routes);
  }

  // ### Start Server

  server([cors(), auth(), route()]).listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });

  return context;
}

/*
 |--------------------------------------------------------------------------------
 | Seed
 |--------------------------------------------------------------------------------
 */

/**
 * Seed server.
 *
 * @param config - Server configuration.
 *
 * @returns server context
 */
export async function seed(config: Config): Promise<Context> {
  const context: Context = {
    mongo: new Mongo(config.mongo.name, config.mongo.uri),
    redis: new Redis({ ...REDIS_DEFAULT_CONFIG, ...(config.redis || {}) })
  };

  await context.mongo.connect();

  return context;
}

/*
 |--------------------------------------------------------------------------------
 | Flush
 |--------------------------------------------------------------------------------
 */

/**
 * Flush server by dumping all mongo and redis data.
 *
 * @param config - Server configuration.
 */
export async function flush(config: Config): Promise<void> {
  const mongo = new Mongo(config.mongo.name, config.mongo.uri);
  const redis = new Redis({ ...REDIS_DEFAULT_CONFIG, ...(config.redis || {}) });

  await mongo.connect();

  await mongo.db.dropDatabase();
  await redis.flushall();
}
