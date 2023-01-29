import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  test,
  expect,
} from '@jest/globals';
import {WebsocketApplication} from 'server/websocket/WebsocketApplication';
import {WebsocketClient} from 'client/websocket/WebsocketClient';
import {ERequestType} from 'types/ERequestType';
import {RawData} from 'ws';
import {EResponseType} from 'types/EResponseType';
import {IErrorResponse} from '../src/types/responses/IErrorResponse';
import {REQUEST_TIMED_OUT} from '../src/server/websocket/errors';

describe('Validating proper timings on messages', () => {
  let server: WebsocketApplication;
  let clientLongTimeout: WebsocketClient;
  let clientFastTimeout: WebsocketClient;

  beforeAll(() => {
    server = new WebsocketApplication({
      port: 3000,
      path: '/ws',
      pingIntervalMs: 1000,
      subscribeWaitMs: 4000,
      unsubscribeWaitMs: 8000,
      maxConnections: 10000,
      isPingEnabled: true,
    });
  });

  beforeEach(() => {
    clientLongTimeout = new WebsocketClient({
      connectionString: 'ws://localhost:3000/ws',
      requestTimeoutMs: 10000,
    });
    clientFastTimeout = new WebsocketClient({
      connectionString: 'ws://localhost:3000/ws',
      requestTimeoutMs: 1000,
    });
  });

  afterEach(() => {
    clientLongTimeout.disconnect();
    clientFastTimeout.disconnect();
  });

  afterAll(async () => {
    await server.stopServer();
  });

  test('Client should receive heartbeat approx each second', async () => {
    return new Promise<void>(resolve => {
      let heartbeat1 = 0;
      let heartbeat2 = 0;

      const removeListener = () => {
        clientLongTimeout.removeOnMessageListener(listener);

        expect(Math.abs(heartbeat2 - heartbeat1)).toBeGreaterThan(1000);
        expect(Math.abs(heartbeat2 - heartbeat1)).toBeLessThan(1100);
        resolve();
      };

      const listener = (data: RawData) => {
        const stringified = data.toString();
        const parsed = JSON.parse(stringified);
        if (parsed.type === EResponseType.HEARTBEAT) {
          if (!heartbeat1) {
            heartbeat1 = Date.now();
          } else if (!heartbeat2) {
            heartbeat2 = Date.now();
          } else {
            removeListener();
          }
        }
      };

      clientLongTimeout.attachOnMessageListener(listener);
    });
  });
  test('Subscribe response should take approx 4s', async () => {
    const start = Date.now();
    await clientLongTimeout.requestCommand(ERequestType.SUBSCRIBE);
    const end = Date.now();

    expect(Math.abs(end - start)).toBeGreaterThan(4000);
    expect(Math.abs(end - start)).toBeLessThan(4300);
  }, 11000);
  test('Unsubscribe response should take approx 8s', async () => {
    const start = Date.now();
    await clientLongTimeout.requestCommand(ERequestType.UNSUBSCRIBE);
    const end = Date.now();

    expect(Math.abs(end - start)).toBeGreaterThan(8000);
    expect(Math.abs(end - start)).toBeLessThan(8300);
  }, 11000);

  test('Request should timeout if takes longer than settings', async () => {
    const start = Date.now();
    const result: IErrorResponse = <IErrorResponse>(
      await clientFastTimeout.requestCommand(ERequestType.UNSUBSCRIBE)
    );
    const end = Date.now();

    expect(Math.abs(end - start)).toBeGreaterThan(1000);
    expect(Math.abs(end - start)).toBeLessThan(1100);
    expect(result.type).toEqual(EResponseType.ERROR);
    expect(result.error).toEqual(REQUEST_TIMED_OUT('0').error);
  });
});
