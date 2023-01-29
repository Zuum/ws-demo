import WebSocket from 'ws';
import {StoreSingleton} from 'server/store';
import {v4 as uuidv4} from 'uuid';
import {IGenericResponse} from 'types/IGenericResponse';
import {JSON_PARSE_ERROR} from 'server/websocket/errors';
import {IGenericRequest} from 'types/IGenericRequest';
import {processMessage} from 'server/websocket/message-router';
import {IMetadata} from 'server/websocket/types/IMetadata';
import {EResponseType} from 'types/EResponseType';
import EventEmitter from 'events';

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
    if (this.socket.readyState !== this.socket.OPEN) {
      console.warn('Server attempting to send on not ready socket');
      return;
    }
    const serializedPayload = JSON.stringify(payload);
    this.socket.send(serializedPayload);
  }

  public subscribeToPing(pinger: EventEmitter): void {
    const pingHandler = this.sendPingMessage.bind(this);
    pinger.on('ping', pingHandler);
    this.socket.once('close', (code, reason) => {
      pinger.removeListener('ping', pingHandler);
    });
  }

  private sendPingMessage(timestamp: number): void {
    this.send({
      type: EResponseType.HEARTBEAT,
      updatedAt: timestamp,
    });
  }

  private subscribeToEmitter() {
    const meta: IMetadata = {id: this.id};
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

    this.socket.once('close', (code, reason) => {
      StoreSingleton.getInstance().removeConnection(this.id);
    });

    this.socket.on('error', error => {
      console.error(`Websocket connection fired error: ${error}`);
    });
  }
}
