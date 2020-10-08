import { container } from "../Container";
import { Bus } from "../Services/Bus";
import { delay } from "../Utils";

export class BusProvider implements Bus {
  /**
   * Create new EventBus instance.
   *
   * @param context - Server context.
   */
  constructor(public context = container.resolve("Context")) {}

  /**
   * Adds the id to the event bus, locking its interaction before allowing
   * subsequent commands to occur within the same id.
   *
   * @param id      - Unique identifier for the bus.
   * @param handler - Function to execute once the bus is reserved.
   */
  public async queue(id: string, handler: Handler): Promise<void> {
    await this.reserve(`conduit:bus:${id}`);
    try {
      await handler();
    } finally {
      this.context.redis.del(`conduit:bus:${id}`);
    }
  }

  /**
   * Attempts to reserve the provided stream id.
   *
   * @param id       - Id to reserve.
   * @param attempts - Number of reservation attempts.
   */
  private async reserve(id: string, attempts = 0): Promise<void> {
    const added = await this.context.redis.setnx(id, "reserved");
    if (added === 0) {
      if (attempts > 10) {
        throw new Error("Server is busy, please wait a few moments and try again.");
      }
      await delay(Math.floor(Math.random() * 2500) + 1000);
      await this.reserve(id, attempts + 1);
    } else {
      await this.context.redis.expire(id, 10);
    }
  }
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

/**
 * Executed when the queue is clear.
 */
type Handler = () => Promise<any>;
