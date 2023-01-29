# Commands

Installing `npm ci`

Testing `npm run test`

Server launch `npm run start:server` - will kill and build `dist` folder

Client launch `npm run start:client` - will NOT build. Assumes `dist` exists

# Environment

Consult `.server.env-example` and `.client.env-example` for variables.

Tested on Windows 10, Node.js 16.13.2, tsc 4.7.4 

# Folder structure
```
src
├───client - code for websocket client
│   │   index.ts - entry point for demo launch
│   │
│   ├───errors
│   │       index.ts - functions returning formatted errors
│   │
│   ├───types
│   │       IWSClientConfig.ts - config object for WebSocketClient class
│   │
│   └───websocket
│           WebsocketClient.ts - wrapper around ws.WebSocket acting as client
│
├───logger
│       index.ts - overrides console.log methods with log4js
│
├───server - code for websocket server
│   │   index.ts - entry point for demo launch
│   │
│   ├───store - store about sessions. In memory, but can be swapped to DB
│   │       index.ts - StoreSignleton class for subscribers storage
│   │       ISubscriber.ts - interface for subscriber element
│   │
│   └───websocket - server part tightly connected to websocket
│       │   SocketConnection.ts - wrapper around ws.WebSocket from server perspective
│       │   WebsocketApplication.ts - wrapper around ws.WebSocketServer
│       │
│       ├───errors
│       │       index.ts - functions returning formatted errors
│       │
│       ├───helpers
│       │       waiter.ts - to wait for 4 and 8 seconds on some ws commands
│       │
│       ├───message-router - handling user requests
│       │   │   index.ts - router, that has info about controllers and passes requests
│       │   │
│       │   └───controllers - concrete handlers for requests
│       │           count-subscribers.ts
│       │           subscribe.ts
│       │           unsubscribe.ts
│       │
│       └───types - server specific interfaces
│               IConfig.ts
│               IController.ts
│               IMessageWithMetadata.ts
│               IMetadata.ts
│
└───types - common types between server and client
    │   ERequestType.ts
    │   EResponseType.ts
    │   IGenericRequest.ts
    │   IGenericResponse.ts
    │
    └───responses - inherited response types
        ICountSubscribersResponse.ts
        IErrorResponse.ts
        ISubscribeResponse.ts
        IUnsubscribeResponse.ts
```

# Assumptions

1. Server application is launched as single instance only. It's not suited for distributed or clustered launch. It won't scale. Also jest tests if done in parallel - should have different ports to not conflict
2. Unsubscribe can be called before subscribe, and will result into successful operation.
3. After subscribe1 -> unsubscribe -> subscribe2 the result of subscribe2 is not same as subscribe1, as it's really a new subscription.
4. Delay for Subscribe and Unsubscribe treated just as "process, wait, respond"
5. To speed up testing all tests except tests for time till response are using 0 delay on responses.
6. Heartbeats are performed on server side via event emitter. So new connections can receive heartbeat faster then 1s.
7. Number of socket connections server can properly handle is limited. There is only a soft limit on how much ping (heartbeat) event emitter can handle.
8. Static class "waiting" for delay is not the best approach. It would have been better to inject different instances of wait to controllers on creation, but it's too time consuming in one-off project w/o framework.
9. I took upon myself liberty to include id into request \ response payload. This helps distinguish responses on requests. (Also better guarantees on idempotency - we can clearly detect duplicated packets if needed)
10. If socket is not yet ready to send messages - they will be buffered and sent as soon as socket is ready.
11. Didn't include auto-reconnect
12. Jest can say that it couldn't exit properly. Needs investigation. Probably server does not manage to close in such a short time.

