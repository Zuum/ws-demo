import * as dotenv from 'dotenv';
dotenv.config({path: './.server.env'});
import 'logger';

import {WebsocketApplication} from 'server/websocket/WebsocketApplication';

new WebsocketApplication({
  pingIntervalMs: 1000,
  subscribeWaitMs: 4000,
  unsubscribeWaitMs: 8000,
  // only used to set max amount of listeners for ping event emitter
  // does not implicitly reject connections above that number
  maxConnections: 10000,
  isPingEnabled: true,
});
