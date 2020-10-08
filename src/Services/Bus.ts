import { Token } from "cmdo-inverse";

export type Bus = {
  /**
   * Adds the id to the request bus, locking its interaction before allowing
   * subsequent requests to occur within the same id namespace.
   *
   * @param id      - Unique identifier for the bus.
   * @param handler - Function to execute once the bus is reserved.
   */
  queue<R = any>(id: string, handler: () => Promise<R>): Promise<void>;
};

export type BusToken = Token<{ new (): Bus }, Bus>;
