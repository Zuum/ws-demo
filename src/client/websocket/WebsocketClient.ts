import WebSocket from 'ws';
import {IWSClientConfig} from 'client/types/IWSClientConfig';
import {IGenericRequest} from 'types/IGenericRequest';

class WebsocketClient {
  private connection: WebSocket;

  constructor(params: IWSClientConfig) {
    this.connection = new WebSocket(params.connectionString);

    this.subscribeToEmitter();
  }

  private sendInternal(payload: IGenericRequest) {
    if (this.connection.readyState !== this.connection.OPEN) {
      console.warn('WSClient send requested while socket is not ready');
      return;
    }
    const serializedPayload = JSON.stringify(payload);
    this.connection.send(serializedPayload);
  }

  private subscribeToEmitter() {}
}
