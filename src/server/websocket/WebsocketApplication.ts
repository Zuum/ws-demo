import {WebSocket, WebSocketServer} from 'ws';
import * as tls from 'tls';
import * as http from 'http';
import * as net from 'net';
import {SocketConnection} from 'server/websocket/SocketConnection';
import {IConfig} from 'server/websocket/types/IConfig';
import EventEmitter from 'events';
import {Waiter} from './helpers/waiter';

export class WebsocketApplication {
  private server: WebSocketServer;
  private port: number;
  private config: IConfig;
  private pinger: EventEmitter;

  constructor(settings: IConfig) {
    this.port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    this.server = new WebSocketServer({
      port: this.port,
      path: '/ws',
    });

    this.config = settings;

    this.pinger = new EventEmitter();
    this.pinger.setMaxListeners(settings.maxConnections);

    // possibly can be done on top level, or injected
    // static class will do for now
    Waiter.setSubscribeWait(settings.subscribeWaitMs);
    Waiter.setUnsubscribeWait(settings.unsubscribeWaitMs);

    if (settings.isPingEnabled) {
      this.pingAllClients();
    }

    this.subscribeToEmitter();
  }

  private subscribeToEmitter() {
    this.server.on('connection', (ws: WebSocket) => {
      const newConnection = new SocketConnection(ws);
      this.pinger.on('ping', timestamp => {
        newConnection.ping(timestamp);
      });
    });

    this.server.on('error', (error: Error) => {
      console.error(error.message);
    });

    this.server.on(
      'wsClientError',
      (
        error: Error,
        socket: net.Socket | tls.TLSSocket,
        request: http.IncomingMessage
      ) => {
        console.error(error.message);
      }
    );

    this.server.on('listening', () => {
      console.log(`Websocket listening on port ${this.port}`);
    });
  }

  private pingAllClients() {
    this.pinger.emit('ping', Date.now());
    setTimeout(() => this.pingAllClients(), this.config.pingIntervalMs);
  }
}
