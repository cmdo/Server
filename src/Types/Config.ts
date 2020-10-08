export type Config = {
  port: number;
  mongo: {
    name: string;
    uri: string;
  };
  redis?: {
    port?: number;
    host?: string;
    keyPrefix?: string;
  };
};
