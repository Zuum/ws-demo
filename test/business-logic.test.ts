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
import {ICountSubscribersResponse} from 'types/responses/ICountSubscribersResponse';

const PORT = 3001;

describe('Proper side effects take place', () => {
  let server: WebsocketApplication;
  let clientFastTimeout1: WebsocketClient;
  let clientFastTimeout2: WebsocketClient;

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
    clientFastTimeout1 = new WebsocketClient({
      connectionString: `ws://localhost:${PORT}/ws`,
      requestTimeoutMs: 1000,
    });
    clientFastTimeout2 = new WebsocketClient({
      connectionString: `ws://localhost:${PORT}/ws`,
      requestTimeoutMs: 1000,
    });
  });

  afterEach(() => {
    clientFastTimeout1.disconnect();
    clientFastTimeout2.disconnect();
  });

  afterAll(async () => {
    await server.stopServer();
  });

  test('CountSubscribers should return 1 subscriber after subscribe command', async () => {
    await clientFastTimeout1.requestCommand(ERequestType.SUBSCRIBE);
    const result: ICountSubscribersResponse = <ICountSubscribersResponse>(
      await clientFastTimeout1.requestCommand(ERequestType.COUNT_SUBSCRIBERS)
    );

    expect(result.count).toEqual(1);
  });

  test('CountSubscribers should return 1 subscriber after subscribe command from any client', async () => {
    await clientFastTimeout1.requestCommand(ERequestType.SUBSCRIBE);
    const result: ICountSubscribersResponse = <ICountSubscribersResponse>(
      await clientFastTimeout2.requestCommand(ERequestType.COUNT_SUBSCRIBERS)
    );

    expect(result.count).toEqual(1);
  });

  test('CountSubscriber should return 2 after two subscribe requests', async () => {
    await Promise.all([
      await clientFastTimeout1.requestCommand(ERequestType.SUBSCRIBE),
      await clientFastTimeout2.requestCommand(ERequestType.SUBSCRIBE),
    ]);
    const result: ICountSubscribersResponse = <ICountSubscribersResponse>(
      await clientFastTimeout2.requestCommand(ERequestType.COUNT_SUBSCRIBERS)
    );

    expect(result.count).toEqual(2);
  });

  test('CountSubscribers should properly detect unsubscribed users', async () => {
    await Promise.all([
      await clientFastTimeout1.requestCommand(ERequestType.SUBSCRIBE),
      await clientFastTimeout2.requestCommand(ERequestType.SUBSCRIBE),
    ]);
    const result1: ICountSubscribersResponse = <ICountSubscribersResponse>(
      await clientFastTimeout2.requestCommand(ERequestType.COUNT_SUBSCRIBERS)
    );

    expect(result1.count).toEqual(2);

    await clientFastTimeout1.requestCommand(ERequestType.UNSUBSCRIBE);

    const result2: ICountSubscribersResponse = <ICountSubscribersResponse>(
      await clientFastTimeout2.requestCommand(ERequestType.COUNT_SUBSCRIBERS)
    );

    expect(result2.count).toEqual(1);
  });

  test('CountSubscribers should properly detect disconnected users as not subscribed', async () => {
    await Promise.all([
      await clientFastTimeout1.requestCommand(ERequestType.SUBSCRIBE),
      await clientFastTimeout2.requestCommand(ERequestType.SUBSCRIBE),
    ]);
    const result1: ICountSubscribersResponse = <ICountSubscribersResponse>(
      await clientFastTimeout2.requestCommand(ERequestType.COUNT_SUBSCRIBERS)
    );

    expect(result1.count).toEqual(2);

    clientFastTimeout1.disconnect();

    // give a bit of time for connection to be closed
    await new Promise(resolve => setTimeout(resolve, 200));

    const result2: ICountSubscribersResponse = <ICountSubscribersResponse>(
      await clientFastTimeout2.requestCommand(ERequestType.COUNT_SUBSCRIBERS)
    );

    expect(result2.count).toEqual(1);
  });

  test('CountSubscribers should not react to same socket subscribed twice', async () => {
    await Promise.all([
      await clientFastTimeout1.requestCommand(ERequestType.SUBSCRIBE),
      await clientFastTimeout1.requestCommand(ERequestType.SUBSCRIBE),
    ]);

    const result1: ICountSubscribersResponse = <ICountSubscribersResponse>(
      await clientFastTimeout2.requestCommand(ERequestType.COUNT_SUBSCRIBERS)
    );

    expect(result1.count).toEqual(1);
  });
});
