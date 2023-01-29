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
import {ISubscribeResponse} from 'types/responses/ISubscribeResponse';
import {EResponseType} from 'types/EResponseType';

const PORT = 3003;

describe('Proper side effects take place', () => {
  let server: WebsocketApplication;
  let clientFastTimeout1: WebsocketClient;

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
  });

  afterEach(() => {
    clientFastTimeout1.disconnect();
  });

  afterAll(async () => {
    await server.stopServer();
  });

  test('Multiple subscribe should produce same response', async () => {
    const result1: ISubscribeResponse = <ISubscribeResponse>(
      await clientFastTimeout1.requestCommand(ERequestType.SUBSCRIBE)
    );
    const result2: ISubscribeResponse = <ISubscribeResponse>(
      await clientFastTimeout1.requestCommand(ERequestType.SUBSCRIBE)
    );

    expect(result1.updatedAt).toEqual(result2.updatedAt);
    expect(result1.type).toEqual(result2.type);
    expect(result1.status).toEqual(result2.status);
  });

  test('Multiple unsubscribe should produce same response', async () => {
    const result1: ISubscribeResponse = <ISubscribeResponse>(
      await clientFastTimeout1.requestCommand(ERequestType.UNSUBSCRIBE)
    );
    const result2: ISubscribeResponse = <ISubscribeResponse>(
      await clientFastTimeout1.requestCommand(ERequestType.UNSUBSCRIBE)
    );

    expect(result1.updatedAt).toEqual(result2.updatedAt);
    expect(result1.type).toEqual(result2.type);
    expect(result1.status).toEqual(result2.status);
  });

  test('Subscribe after unsubscribe should be treated as new request', async () => {
    const result1: ISubscribeResponse = <ISubscribeResponse>(
      await clientFastTimeout1.requestCommand(ERequestType.SUBSCRIBE)
    );
    await clientFastTimeout1.requestCommand(ERequestType.UNSUBSCRIBE);
    const result2: ISubscribeResponse = <ISubscribeResponse>(
      await clientFastTimeout1.requestCommand(ERequestType.SUBSCRIBE)
    );

    expect(result1.updatedAt).not.toEqual(result2.updatedAt);
    expect(result1.type).toEqual(EResponseType.SUBSCRIBE);
    expect(result1.status).toEqual('Subscribed');
  });
});
