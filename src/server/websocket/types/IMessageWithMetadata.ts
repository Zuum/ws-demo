import {IMessageMetadata} from 'server/websocket/types/IMessageMetadata';
import {IGenericRequest} from 'server/websocket/types/IGenericRequest';

export interface IMessageWithMetadata {
  meta: IMessageMetadata;
  message: IGenericRequest;
}
