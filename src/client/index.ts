import * as dotenv from 'dotenv';
import 'logger';

import {WebsocketClient} from 'client/websocket/WebsocketClient';
import {ERequestType} from '../types/ERequestType';

dotenv.config({path: './.client.env'});

const client = new WebsocketClient({
  connectionString:
    process.env.WS_CONNECTION_STRING || 'ws://localhost:3000/ws',
  requestTimeoutMs: 60000,
});

async function doStuff() {
  await client.requestCommand(ERequestType.SUBSCRIBE);
  await client.requestCommand(ERequestType.COUNT_SUBSCRIBERS);
  await client.requestCommand(ERequestType.UNSUBSCRIBE);
}

setTimeout(doStuff, 1000);
