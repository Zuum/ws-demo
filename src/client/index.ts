import * as dotenv from 'dotenv';
dotenv.config({path: './.client.env'});

import 'logger';

import {WebsocketClient} from 'client/websocket/WebsocketClient';
import {ERequestType} from '../types/ERequestType';

const client = new WebsocketClient({
  connectionString:
    process.env.WS_CONNECTION_STRING || 'ws://localhost:3000/ws',
  requestTimeoutMs: 60000,
});

async function doStuff() {
  console.log(await client.requestCommand(ERequestType.SUBSCRIBE));
  console.log(await client.requestCommand(ERequestType.COUNT_SUBSCRIBERS));
  console.log(await client.requestCommand(ERequestType.UNSUBSCRIBE));
}

setTimeout(doStuff, 1000);
