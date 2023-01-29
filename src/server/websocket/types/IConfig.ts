export interface IConfig {
  port: number;
  path: string;
  pingIntervalMs: number;
  subscribeWaitMs: number;
  unsubscribeWaitMs: number;
  maxConnections: number;
  isPingEnabled: boolean;
}
