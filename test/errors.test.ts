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
import {EResponseType} from 'types/EResponseType';
import {IErrorResponse} from 'types/responses/IErrorResponse';
import WebSocket, {RawData} from 'ws';

const PORT = 3002;

describe('Errors are handled', () => {
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

  // There is no way client can
  test('Non JSON payload error', async () => {
    return new Promise<void>(resolve => {
      const removeListener = () => {
        clientFastTimeout1.removeOnMessageListener(listener);
        resolve();
      };

      const listener = (data: RawData) => {
        const stringified = data.toString();
        const parsed = JSON.parse(stringified);
        if (parsed.type === EResponseType.ERROR) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(parsed.error).toEqual('Bad formatted payload, non JSON');
          // eslint-disable-next-line jest/no-conditional-expect
          expect(parsed.type).toEqual(EResponseType.ERROR);
          // eslint-disable-next-line jest/no-conditional-expect
          expect(parsed).toHaveProperty('updatedAt');
          // eslint-disable-next-line jest/no-conditional-expect
          expect(parsed.updatedAt).toEqual(expect.any(Number));
          removeListener();
        }
      };

      clientFastTimeout1.attachOnMessageListener(listener);

      // should be not possible during general usage
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      clientFastTimeout1.connection.on('open', () =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        clientFastTimeout1.connection.send('Gibberish')
      );
    });
  });

  test('Unknown signature', async () => {
    const result: IErrorResponse = <IErrorResponse>(
      await clientFastTimeout1.requestCommand(ERequestType.UNSUPPORTED_TYPE)
    );

    expect(result.error).toEqual('Requested method not implemented');
    expect(result.type).toEqual(EResponseType.ERROR);
    expect(result).toHaveProperty('updatedAt');
    expect(result.updatedAt).toEqual(expect.any(Number));
  });
});
