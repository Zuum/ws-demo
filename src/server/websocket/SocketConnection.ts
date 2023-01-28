import WebSocket from 'ws';
import {StoreSingleton} from 'server/store';
import {v4 as uuidv4} from 'uuid';
import {IGenericResponse} from 'server/websocket/types/IGenericResponse';
import {JSON_PARSE_ERROR} from 'server/websocket/errors';
import {IGenericRequest} from 'server/websocket/types/IGenericRequest';
import {processMessage} from 'server/websocket/message-router';
import {IMessageMetadata} from 'server/websocket/types/IMessageMetadata';
import {EResponseType} from './types/EResponseType';

export class SocketConnection {
  private socket: WebSocket;
  private id: string;

  constructor(ws: WebSocket) {
    this.socket = ws;
    this.id = uuidv4();

    StoreSingleton.getInstance().addConnection({
      id: this.id,
    });

    this.subscribeToEmitter();
  }

  private send(payload: IGenericResponse) {
    const serializedPayload = JSON.stringify(payload);
    this.socket.send(serializedPayload);
  }

  public ping(timestamp: number): void {
    this.send({
      type: EResponseType.HEARTBEAT,
      updatedAt: timestamp,
    });
  }

  private subscribeToEmitter() {
    const meta: IMessageMetadata = {id: this.id};
    this.socket.on('message', async data => {
      const rawData: string = data.toString();
      let message: IGenericRequest;
      try {
        message = JSON.parse(rawData);
      } catch (err) {
        return this.send(JSON_PARSE_ERROR());
      }

      const result = await processMessage({meta, message});

      this.send(result);
    });

    this.socket.on('close', (code, reason) => {
      StoreSingleton.getInstance().removeConnection(this.id);
    });

    this.socket.on('error', error => {
      console.error(`Websocket connection fired error: ${error}`);
    });
  }
}
