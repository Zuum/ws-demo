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
import {ISubscribeResponse} from 'types/responses/ISubscribeResponse';
import {IUnsubscribeResponse} from 'types/responses/IUnsubscribeResponse';
import {ICountSubscribersResponse} from 'types/responses/ICountSubscribersResponse';

const PORT = 3004;

describe('Responses should have proper signature', () => {
  let server: WebsocketApplication;
  let clientFastTimeout: WebsocketClient;

  beforeAll(() => {
    server = new WebsocketApplication({
      port: PORT,
      path: '/ws',
      pingIntervalMs: 1000,
      subscribeWaitMs: 0,
      unsubscribeWaitMs: 0,
      maxConnections: 10000,
      isPingEnabled: true,
    });
  });

  beforeEach(() => {
    clientFastTimeout = new WebsocketClient({
      connectionString: `ws://localhost:${PORT}/ws`,
      requestTimeoutMs: 1000,
    });
  });

  afterEach(() => {
    clientFastTimeout.disconnect();
  });

  afterAll(async () => {
    await server.stopServer();
  });

  test('Heartbeat signature', async () => {
    await new Promise<void>(resolve => {
      const removeListener = () => {
        clientFastTimeout.removeOnMessageListener(listener);
        resolve();
      };

      const listener = (data: RawData) => {
        const stringified = data.toString();
        const parsed = JSON.parse(stringified);
        expect(parsed.type).toEqual(EResponseType.HEARTBEAT);
        expect(parsed).toHaveProperty('updatedAt');
        expect(parsed.updatedAt).toEqual(expect.any(Number));

        removeListener();
      };

      clientFastTimeout.attachOnMessageListener(listener);
    });
  });
  test('Subscribe signature', async () => {
    const result: ISubscribeResponse = <ISubscribeResponse>(
      await clientFastTimeout.requestCommand(ERequestType.SUBSCRIBE)
    );

    expect(result.type).toEqual(EResponseType.SUBSCRIBE);
    expect(result.status).toEqual('Subscribed');
    expect(result).toHaveProperty('updatedAt');
    expect(result.updatedAt).toEqual(expect.any(Number));
  });
  test('Unsubscribe signature', async () => {
    const result: IUnsubscribeResponse = <IUnsubscribeResponse>(
      await clientFastTimeout.requestCommand(ERequestType.UNSUBSCRIBE)
    );

    expect(result.type).toEqual(EResponseType.UNSUBSCRIBE);
    expect(result.status).toEqual('Unsubscribed');
    expect(result).toHaveProperty('updatedAt');
    expect(result.updatedAt).toEqual(expect.any(Number));
  });

  test('CountSubscribers signature', async () => {
    const result: ICountSubscribersResponse = <ICountSubscribersResponse>(
      await clientFastTimeout.requestCommand(ERequestType.COUNT_SUBSCRIBERS)
    );

    expect(result.type).toEqual(EResponseType.COUNT_SUBSCRIBERS);
    expect(result.count).toEqual(expect.any(Number));
    expect(result).toHaveProperty('updatedAt');
    expect(result.updatedAt).toEqual(expect.any(Number));
  });
});
