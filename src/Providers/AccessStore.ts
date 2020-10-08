import { AccessGrantOperation, AccessGrantsData, AccessStore } from "cmdo-access";

import { container } from "../Container";

export class AccessStoreProvider implements AccessStore {
  private collection = "Access";

  /**
   * Create a new AccessAdapter instance.
   *
   * @param context - Server context.
   */
  constructor(public context = container.resolve("Context")) {}

  /**
   * Set access grants for given access control id.
   *
   * @param id         - Unique persistent storage id.
   * @param acid       - Access control id.
   * @param operations - List of grant operations to perform.
   */
  public async setGrants(id: string, acid: string, operations: AccessGrantOperation[]): Promise<void> {
    const update: any = {};
    const $set: any = {};
    const $unset: any = {};

    for (const { type, resource, action, data = true } of operations) {
      switch (type) {
        case "set": {
          $set[`grants.${acid}.${resource}.${action}`] = data;
          break;
        }
        case "unset": {
          let path = `grants.${acid}.${resource}`;
          if (action) {
            path += `.${action}`;
          }
          $unset[path] = "";
          break;
        }
      }
    }

    if (Object.keys($set).length) {
      update.$set = $set;
    }

    if (Object.keys($unset).length) {
      update.$set = $unset;
    }

    await this.context.mongo.db.collection(this.collection).updateOne({ id }, update, { upsert: true });
  }

  /**
   * Get access control instance for given access control id.
   *
   * @param id - Unique persistent storage id.
   *
   * @returns grants
   */
  public async getGrants(id: string): Promise<AccessGrantsData> {
    const access = await this.context.mongo.db.collection(this.collection).findOne({ id });
    if (access) {
      return access.grants;
    }
    return {};
  }
}
