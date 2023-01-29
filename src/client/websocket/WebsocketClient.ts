import WebSocket, {RawData} from 'ws';
import {IWSClientConfig} from 'client/types/IWSClientConfig';
import {IGenericRequest} from 'types/IGenericRequest';
import {ERequestType} from 'types/ERequestType';
import {IGenericResponse} from 'types/IGenericResponse';
import {v4 as uuidv4} from 'uuid';
import {EResponseType} from '../../types/EResponseType';
import {IErrorResponse} from '../../types/responses/IErrorResponse';

type Executor = (
  value: IGenericResponse | PromiseLike<IGenericResponse>
) => void;

type MessageHandler = (data: RawData) => void;

export class WebsocketClient {
  private connection: WebSocket;
  private pendingRequests: Map<string, Executor> = new Map<string, Executor>();
  private config: IWSClientConfig;

  constructor(params: IWSClientConfig) {
    this.connection = new WebSocket(params.connectionString);
    this.config = params;

    this.subscribeToEmitter();
  }

  private send(payload: IGenericRequest): void {
    if (this.connection.readyState !== this.connection.OPEN) {
      console.warn('WSClient send requested while socket is not ready');
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
    this.connection.on('message', data => {
      const deserialied = this.parseMessage(data);
      // TODO: for tracing purposes
      console.log(deserialied);

      if (deserialied.id) {
        const executor = this.pendingRequests.get(deserialied.id);
        if (executor) {
          executor(deserialied);
          this.pendingRequests.delete(deserialied.id);
        }
      }
    });

    this.connection.on('close', (code, reason) => {
      console.log('ConnectionClosed');
    });

    this.connection.on('error', error => {
      console.error(error);
    });
  }

  public async requestCommand(type: ERequestType): Promise<IGenericResponse> {
    const id = uuidv4();
    this.send({
      type,
      id,
    });

    const newPromise = new Promise<IGenericResponse>(resolve => {
      this.pendingRequests.set(id, resolve);
    });

    const timeoutPromise = new Promise<IErrorResponse>(resolve => {
      setTimeout(resolve, this.config.requestTimeoutMs, {
        id,
        type: EResponseType.ERROR,
        updatedAt: 0,
        error: 'Timeout while waiting for response',
      });
    });

    return Promise.race([newPromise, timeoutPromise]);
  }
}
