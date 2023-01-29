import WebSocket, {RawData} from 'ws';
import {IWSClientConfig} from 'client/types/IWSClientConfig';
import {IGenericRequest} from 'types/IGenericRequest';
import {ERequestType} from 'types/ERequestType';
import {IGenericResponse} from 'types/IGenericResponse';
import {v4 as uuidv4} from 'uuid';
import {EResponseType} from '../../types/EResponseType';
import {IErrorResponse} from '../../types/responses/IErrorResponse';
import {REQUEST_TIMED_OUT} from '../../server/websocket/errors';
import Timeout = NodeJS.Timeout;

type Executor = (
  value: IGenericResponse | PromiseLike<IGenericResponse>
) => void;

type MessageHandler = (data: RawData) => void;

export class WebsocketClient {
  private connection: WebSocket;
  private pendingRequests: Map<string, Executor> = new Map<string, Executor>();
  private pendingTimeouts: Map<string, number> = new Map<string, number>();
  private config: IWSClientConfig;
  private bufferedSends: IGenericRequest[] = [];

  constructor(params: IWSClientConfig) {
    this.connection = new WebSocket(params.connectionString);
    this.config = params;

    this.subscribeToEmitter();
  }

  private send(payload: IGenericRequest): void {
    if (this.connection.readyState !== this.connection.OPEN) {
      console.warn('WSClient send requested while socket is not ready');
      this.bufferedSends.push(payload);
      return;
    }
    const serializedPayload = JSON.stringify(payload);
    this.connection.send(serializedPayload);
  }

  private parseMessage(rawData: RawData): IGenericResponse {
    // TODO: not type safe
    const stringified = rawData.toString();
    try {
      return JSON.parse(stringified);
    } catch (e) {
      console.error(`Non JSON payload: ${stringified}`);
      return {
        type: EResponseType.ERROR,
        updatedAt: 0,
      };
    }
  }

  public isReady() {
    return this.connection.readyState === this.connection.OPEN;
  }

  public attachOnMessageListener(listener: MessageHandler) {
    this.connection.on('message', listener);
  }

  public removeOnMessageListener(listener: MessageHandler) {
    this.connection.removeListener('message', listener);
  }

  private subscribeToEmitter() {
    this.connection.on('open', () => {
      this.bufferedSends.forEach(payload => {
        this.send(payload);
      });
    });

    this.connection.on('message', data => {
      const deserialized = this.parseMessage(data);
      const {id} = deserialized;

      if (id) {
        const executor = this.pendingRequests.get(id);
        if (executor) {
          executor(deserialized);
          clearTimeout(this.pendingTimeouts.get(id));
          this.clearPendingMaps(id);
        }
      }
    });

    this.connection.on('close', (code, reason) => {});

    this.connection.on('error', error => {
      console.error(error);
    });
  }

  private clearPendingMaps(id: string) {
    this.pendingTimeouts.delete(id);
    this.pendingRequests.delete(id);
  }

  public async requestCommand(type: ERequestType): Promise<IGenericResponse> {
    const id = uuidv4();
    this.send({
      type,
      id,
    });

    const waitForResponseOrTimeout = new Promise<IGenericResponse>(resolve => {
      this.pendingRequests.set(id, resolve);
      const clearPendingMaps = this.clearPendingMaps.bind(this);

      const sendTimeoutResult = (payload: IErrorResponse) => {
        clearPendingMaps(id);
        resolve(payload);
      };

      const timeout = setTimeout(
        sendTimeoutResult,
        this.config.requestTimeoutMs,
        REQUEST_TIMED_OUT(id)
      );

      this.pendingTimeouts.set(id, timeout);
    });

    return waitForResponseOrTimeout;
  }

  public disconnect() {
    this.connection.terminate();
  }
}
