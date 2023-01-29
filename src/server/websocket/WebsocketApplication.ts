import {WebSocket, WebSocketServer} from 'ws';
import * as tls from 'tls';
import * as http from 'http';
import * as net from 'net';
import {SocketConnection} from 'server/websocket/SocketConnection';
import {IConfig} from 'server/websocket/types/IConfig';
import EventEmitter from 'events';
import {Waiter} from 'server/websocket/helpers/waiter';

export class WebsocketApplication {
  private server: WebSocketServer;
  private port: number;
  private config: IConfig;
  private pinger: EventEmitter;
  private pingTimeout: NodeJS.Timeout | undefined;

  constructor(settings: IConfig) {
    this.port = settings.port;
    this.server = new WebSocketServer({
      port: this.port,
      path: settings.path,
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
      newConnection.subscribeToPing(this.pinger);
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

    this.server.on('close', () => {});
  }

  private pingAllClients() {
    this.pinger.emit('ping', Date.now());
    this.pingTimeout = setTimeout(
      () => this.pingAllClients(),
      this.config.pingIntervalMs
    );
  }

  public async stopServer(): Promise<void> {
    return new Promise(resolve => {
      this.server.close(() => {
        this.server.clients.forEach(client => {
          client.close();
        });
        this.pinger.removeAllListeners('ping');
        clearTimeout(this.pingTimeout);
      });
      resolve();
    });
  }
}
