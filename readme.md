# Requirements

<details>
<summary>Original task requirements</summary>

```
Create NodeJS application (Server and Client) that would utilize WebSocket transport and use json as
a contract based approach.
Server should handle 3 methods: Subscribe, Unsubscribe, CountSubscribers.
Common message pattern should looks like this:
{
 "type": Subscribe | Unscubscribe | CountSubscribers
}
In case of Subscribe was requested server should answer with status message Subscribed and
timestamp when it took place after await for 4 seconds.
{
 "type": Subscribe,
 "status": "Subscribed",
 "updatedAt": ***
}
In case of Unsubscribe was requested server should answer with status message Unsubscribed and
timestamp when it took place after await for 8 seconds.
{
 "type": Unscubscribe,
 "status": "Unsubscribed",
 "updatedAt": ***
}
Both methods should act with idempotence (should acknowledge current state and return same
response for first and all next calls).
In case of CountSubscribers was requested server should answer with number of current
subscriptions and timestamp when it was counted.
{
 "type": CountSubscribers,
 "count": ***
 "updatedAt": ***
}
On any other requests, server should return error message:
{
 "type": Error,
 "error": "Requested method not implemented",
 "updatedAt": ***
}
And in case of request was made with non-than json payload server should return this error
message:
{
 "type": Error,
 "error": "Bad formatted payload, non JSON",
 "updatedAt": ***
}
In addition to this methods, server should produce heartbeat events every second:
{
 "type": Heatbeat,
 "updatedAt": ***
}
Client part should be written in the same NodeJS application, different module.
Both: a server and a client should be tested via integration tests.
```

</details>

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


# Postman docs
<div class="right-context-bar-content-container"><div class="right-context-bar-header"><span class="right-context-bar__title">Documentation</span><div class="right-context__actions-container"><div class="btn btn-tertiary context-bar-actions__button" tabindex="0" data-testid="base-button"><i class="IconWrapper__IconContainer-gnjn48-0 gkhcSN right-context-bar__close-icon" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.70711 8.00001L13.3536 3.35356L12.6465 2.64645L8.00001 7.2929L3.35356 2.64645L2.64645 3.35356L7.2929 8.00001L2.64645 12.6465L3.35356 13.3536L8.00001 8.70711L12.6465 13.3536L13.3536 12.6465L8.70711 8.00001Z" fill="#6B6B6B"></path></svg></i></div></div></div><div class="websocket-request-documentation"><div class="websocket-request-documentation__body"><div class="websocket-request-description"><div><div class="description-preview description-preview--editable"><div class="description-preview__placeholder">Add request description…</div><div class="description-preview__edit-icon"><i color="content-color-secondary" class="IconWrapper__IconContainer-gnjn48-0 eTmUbn" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.5592 1.35352C12.9734 0.767737 12.0237 0.767739 11.4379 1.35352L1.64502 11.1464C1.57133 11.2201 1.5225 11.315 1.50537 11.4178L1.02839 14.2797C0.960706 14.6858 1.31277 15.0378 1.71886 14.9702L4.58077 14.4932C4.68356 14.476 4.77843 14.4272 4.85212 14.3535L14.645 4.56063C15.2308 3.97484 15.2308 3.0251 14.645 2.43931L13.5592 1.35352ZM12.145 2.06063C12.3403 1.86537 12.6569 1.86537 12.8521 2.06063L13.9379 3.14642C14.1332 3.34168 14.1332 3.65826 13.9379 3.85352L12.1057 5.68576L10.3128 3.89287L12.145 2.06063ZM9.60568 4.59997L2.46542 11.7402L2.10685 13.8917L4.25832 13.5331L11.3986 6.39287L9.60568 4.59997Z" fill="#4F4F4F"></path></svg></i></div></div></div></div><div class="websocket-request-documentation__body__url"><h3 color="" class="Heading__StyledHeading-sc-137awpp-0 hgtwBW" data-aether-id="aether-heading" data-testid="aether-heading" data-click="">URL</h3><div class="request-documentation--url"><code class="Code__StyledCode-sc-1isf2cc-0 kAwhHh" data-aether-id="aether-text-code">ws://localhost:3000/ws</code></div></div><div class="sc-fzqAbL jcuRyp"><span>Query Params</span></div><div class="sc-fzqAbL jcuRyp"><span>Headers</span></div><div class="sc-fzqAbL jcuRyp"><span>Settings</span></div><div class="raw-websocket-messages-documentation"><h3 color="content-color-primary" class="Heading__StyledHeading-sc-137awpp-0 berbvC" data-aether-id="aether-heading" data-testid="aether-heading" data-click="">Messages</h3><div class="raw-websocket-messages-documentation__item"><h6 color="content-color-primary" class="Heading__StyledHeading-sc-137awpp-0 fMnxc" data-aether-id="aether-heading" data-testid="aether-heading" data-click="">Subscribe</h6><div class="highlighted-code highlighted-code--documentation" data-testid="enhanced-code"><div class="highlighted-code__config-container"><div class="highlighted-code__language-label">Text</div><div class="highlighted-code__spacer"></div><div class="btn btn-tertiary highlighted-code__config-button" tabindex="0" data-testid="base-button"><i color="content-color-primary" class="IconWrapper__IconContainer-gnjn48-0 fHTjrY" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3H1V2H15V3Z" fill="#6B6B6B"></path><path d="M12 8H1V7H12C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13H9.70712L11.3536 14.6464L10.6465 15.3536L7.79291 12.5L10.6465 9.64645L11.3536 10.3536L9.70712 12H12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8Z" fill="#6B6B6B"></path><path d="M1 13H6V12H1V13Z" fill="#6B6B6B"></path></svg></i></div><div class="btn btn-tertiary highlighted-code__config-button" tabindex="0" data-testid="base-button"><i class="IconWrapper__IconContainer-gnjn48-0 gkhcSN code-copy" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 9.5C2 9.77614 2.22386 10 2.5 10H3V11H2.5C1.67157 11 1 10.3284 1 9.5V2.5C1 1.67157 1.67157 1 2.5 1H9.5C10.3284 1 11 1.67157 11 2.5V3H10V2.5C10 2.22386 9.77614 2 9.5 2H2.5C2.22386 2 2 2.22386 2 2.5V9.5Z" fill="#6B6B6B"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 5C5.67157 5 5 5.67157 5 6.5V13.5C5 14.3284 5.67157 15 6.5 15H13.5C14.3284 15 15 14.3284 15 13.5V6.5C15 5.67157 14.3284 5 13.5 5H6.5ZM6 6.5C6 6.22386 6.22386 6 6.5 6H13.5C13.7761 6 14 6.22386 14 6.5V13.5C14 13.7761 13.7761 14 13.5 14H6.5C6.22386 14 6 13.7761 6 13.5V6.5Z" fill="#6B6B6B"></path></svg></i></div></div><pre class="highlighted-code__code-container text"><code class="highlighted-code__code"><code class="syntax-highlighted-code"><span><span class="mtk1">{</span></span><br><span><span class="mtk1">&nbsp;&nbsp;"type":&nbsp;"Subscribe"</span></span><br><span><span class="mtk1">}</span></span><br></code></code></pre></div></div><div class="raw-websocket-messages-documentation__item"><h6 color="content-color-primary" class="Heading__StyledHeading-sc-137awpp-0 fMnxc" data-aether-id="aether-heading" data-testid="aether-heading" data-click="">Unsubscribe</h6><div class="highlighted-code highlighted-code--documentation" data-testid="enhanced-code"><div class="highlighted-code__config-container"><div class="highlighted-code__language-label">json</div><div class="highlighted-code__spacer"></div><div class="btn btn-tertiary highlighted-code__config-button" tabindex="0" data-testid="base-button"><i color="content-color-primary" class="IconWrapper__IconContainer-gnjn48-0 fHTjrY" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3H1V2H15V3Z" fill="#6B6B6B"></path><path d="M12 8H1V7H12C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13H9.70712L11.3536 14.6464L10.6465 15.3536L7.79291 12.5L10.6465 9.64645L11.3536 10.3536L9.70712 12H12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8Z" fill="#6B6B6B"></path><path d="M1 13H6V12H1V13Z" fill="#6B6B6B"></path></svg></i></div><div class="btn btn-tertiary highlighted-code__config-button" tabindex="0" data-testid="base-button"><i class="IconWrapper__IconContainer-gnjn48-0 gkhcSN code-copy" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 9.5C2 9.77614 2.22386 10 2.5 10H3V11H2.5C1.67157 11 1 10.3284 1 9.5V2.5C1 1.67157 1.67157 1 2.5 1H9.5C10.3284 1 11 1.67157 11 2.5V3H10V2.5C10 2.22386 9.77614 2 9.5 2H2.5C2.22386 2 2 2.22386 2 2.5V9.5Z" fill="#6B6B6B"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 5C5.67157 5 5 5.67157 5 6.5V13.5C5 14.3284 5.67157 15 6.5 15H13.5C14.3284 15 15 14.3284 15 13.5V6.5C15 5.67157 14.3284 5 13.5 5H6.5ZM6 6.5C6 6.22386 6.22386 6 6.5 6H13.5C13.7761 6 14 6.22386 14 6.5V13.5C14 13.7761 13.7761 14 13.5 14H6.5C6.22386 14 6 13.7761 6 13.5V6.5Z" fill="#6B6B6B"></path></svg></i></div></div><pre class="highlighted-code__code-container json"><code class="highlighted-code__code"><code class="syntax-highlighted-code"><span><span class="mtk1">{</span></span><br><span><span class="mtk1">&nbsp;&nbsp;</span><span class="mtk32">"type"</span><span class="mtk1">:&nbsp;</span><span class="mtk6">"Unsubscribe"</span></span><br><span><span class="mtk1">}</span></span><br></code></code></pre></div></div><div class="raw-websocket-messages-documentation__item"><h6 color="content-color-primary" class="Heading__StyledHeading-sc-137awpp-0 fMnxc" data-aether-id="aether-heading" data-testid="aether-heading" data-click="">CountSubscribers</h6><div class="highlighted-code highlighted-code--documentation" data-testid="enhanced-code"><div class="highlighted-code__config-container"><div class="highlighted-code__language-label">json</div><div class="highlighted-code__spacer"></div><div class="btn btn-tertiary highlighted-code__config-button" tabindex="0" data-testid="base-button"><i color="content-color-primary" class="IconWrapper__IconContainer-gnjn48-0 fHTjrY" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3H1V2H15V3Z" fill="#6B6B6B"></path><path d="M12 8H1V7H12C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13H9.70712L11.3536 14.6464L10.6465 15.3536L7.79291 12.5L10.6465 9.64645L11.3536 10.3536L9.70712 12H12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8Z" fill="#6B6B6B"></path><path d="M1 13H6V12H1V13Z" fill="#6B6B6B"></path></svg></i></div><div class="btn btn-tertiary highlighted-code__config-button" tabindex="0" data-testid="base-button"><i class="IconWrapper__IconContainer-gnjn48-0 gkhcSN code-copy" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 9.5C2 9.77614 2.22386 10 2.5 10H3V11H2.5C1.67157 11 1 10.3284 1 9.5V2.5C1 1.67157 1.67157 1 2.5 1H9.5C10.3284 1 11 1.67157 11 2.5V3H10V2.5C10 2.22386 9.77614 2 9.5 2H2.5C2.22386 2 2 2.22386 2 2.5V9.5Z" fill="#6B6B6B"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 5C5.67157 5 5 5.67157 5 6.5V13.5C5 14.3284 5.67157 15 6.5 15H13.5C14.3284 15 15 14.3284 15 13.5V6.5C15 5.67157 14.3284 5 13.5 5H6.5ZM6 6.5C6 6.22386 6.22386 6 6.5 6H13.5C13.7761 6 14 6.22386 14 6.5V13.5C14 13.7761 13.7761 14 13.5 14H6.5C6.22386 14 6 13.7761 6 13.5V6.5Z" fill="#6B6B6B"></path></svg></i></div></div><pre class="highlighted-code__code-container json"><code class="highlighted-code__code"><code class="syntax-highlighted-code"><span><span class="mtk1">{</span></span><br><span><span class="mtk1">&nbsp;&nbsp;</span><span class="mtk32">"type"</span><span class="mtk1">:&nbsp;</span><span class="mtk6">"CountSubscribers"</span></span><br><span><span class="mtk1">}</span></span><br></code></code></pre></div></div><div class="raw-websocket-messages-documentation__item"><h6 color="content-color-primary" class="Heading__StyledHeading-sc-137awpp-0 fMnxc" data-aether-id="aether-heading" data-testid="aether-heading" data-click="">DoesNotExist</h6><div class="highlighted-code highlighted-code--documentation" data-testid="enhanced-code"><div class="highlighted-code__config-container"><div class="highlighted-code__language-label">json</div><div class="highlighted-code__spacer"></div><div class="btn btn-tertiary highlighted-code__config-button" tabindex="0" data-testid="base-button"><i color="content-color-primary" class="IconWrapper__IconContainer-gnjn48-0 fHTjrY" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3H1V2H15V3Z" fill="#6B6B6B"></path><path d="M12 8H1V7H12C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13H9.70712L11.3536 14.6464L10.6465 15.3536L7.79291 12.5L10.6465 9.64645L11.3536 10.3536L9.70712 12H12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8Z" fill="#6B6B6B"></path><path d="M1 13H6V12H1V13Z" fill="#6B6B6B"></path></svg></i></div><div class="btn btn-tertiary highlighted-code__config-button" tabindex="0" data-testid="base-button"><i class="IconWrapper__IconContainer-gnjn48-0 gkhcSN code-copy" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 9.5C2 9.77614 2.22386 10 2.5 10H3V11H2.5C1.67157 11 1 10.3284 1 9.5V2.5C1 1.67157 1.67157 1 2.5 1H9.5C10.3284 1 11 1.67157 11 2.5V3H10V2.5C10 2.22386 9.77614 2 9.5 2H2.5C2.22386 2 2 2.22386 2 2.5V9.5Z" fill="#6B6B6B"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 5C5.67157 5 5 5.67157 5 6.5V13.5C5 14.3284 5.67157 15 6.5 15H13.5C14.3284 15 15 14.3284 15 13.5V6.5C15 5.67157 14.3284 5 13.5 5H6.5ZM6 6.5C6 6.22386 6.22386 6 6.5 6H13.5C13.7761 6 14 6.22386 14 6.5V13.5C14 13.7761 13.7761 14 13.5 14H6.5C6.22386 14 6 13.7761 6 13.5V6.5Z" fill="#6B6B6B"></path></svg></i></div></div><pre class="highlighted-code__code-container json"><code class="highlighted-code__code"><code class="syntax-highlighted-code"><span><span class="mtk1">{</span></span><br><span><span class="mtk1">&nbsp;&nbsp;</span><span class="mtk32">"type"</span><span class="mtk1">:&nbsp;</span><span class="mtk6">"DoesNotExist"</span></span><br><span><span class="mtk1">}</span></span><br></code></code></pre></div></div><div class="raw-websocket-messages-documentation__item"><h6 color="content-color-primary" class="Heading__StyledHeading-sc-137awpp-0 fMnxc" data-aether-id="aether-heading" data-testid="aether-heading" data-click="">NotAJSON</h6><div class="highlighted-code highlighted-code--documentation" data-testid="enhanced-code"><div class="highlighted-code__config-container"><div class="highlighted-code__language-label">Text</div><div class="highlighted-code__spacer"></div><div class="btn btn-tertiary highlighted-code__config-button" tabindex="0" data-testid="base-button"><i color="content-color-primary" class="IconWrapper__IconContainer-gnjn48-0 fHTjrY" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3H1V2H15V3Z" fill="#6B6B6B"></path><path d="M12 8H1V7H12C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13H9.70712L11.3536 14.6464L10.6465 15.3536L7.79291 12.5L10.6465 9.64645L11.3536 10.3536L9.70712 12H12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8Z" fill="#6B6B6B"></path><path d="M1 13H6V12H1V13Z" fill="#6B6B6B"></path></svg></i></div><div class="btn btn-tertiary highlighted-code__config-button" tabindex="0" data-testid="base-button"><i class="IconWrapper__IconContainer-gnjn48-0 gkhcSN code-copy" title=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 9.5C2 9.77614 2.22386 10 2.5 10H3V11H2.5C1.67157 11 1 10.3284 1 9.5V2.5C1 1.67157 1.67157 1 2.5 1H9.5C10.3284 1 11 1.67157 11 2.5V3H10V2.5C10 2.22386 9.77614 2 9.5 2H2.5C2.22386 2 2 2.22386 2 2.5V9.5Z" fill="#6B6B6B"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 5C5.67157 5 5 5.67157 5 6.5V13.5C5 14.3284 5.67157 15 6.5 15H13.5C14.3284 15 15 14.3284 15 13.5V6.5C15 5.67157 14.3284 5 13.5 5H6.5ZM6 6.5C6 6.22386 6.22386 6 6.5 6H13.5C13.7761 6 14 6.22386 14 6.5V13.5C14 13.7761 13.7761 14 13.5 14H6.5C6.22386 14 6 13.7761 6 13.5V6.5Z" fill="#6B6B6B"></path></svg></i></div></div><pre class="highlighted-code__code-container text"><code class="highlighted-code__code"><code class="syntax-highlighted-code"><span><span class="mtk1">NotAJSON</span></span><br></code></code></pre></div></div></div></div></div></div>
