import * as dotenv from 'dotenv';
dotenv.config({path: './.server.env'});
import 'logger';

import {WebsocketApplication} from 'server/websocket/WebsocketApplication';

const app = new WebsocketApplication({
  // ensuring 3000 if PORT is true, but parses to NaN
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  path: process.env.SOCKET_PATH || '/ws',
  pingIntervalMs: 1000,
  subscribeWaitMs: 4000,
  unsubscribeWaitMs: 8000,
  // only used to set max amount of listeners for ping event emitter
  // does not implicitly reject connections above that number
  maxConnections: 10000,
  isPingEnabled: true,
});
