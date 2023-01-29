import {IMetadata} from 'server/websocket/types/IMetadata';
import {IGenericRequest} from 'types/IGenericRequest';

export interface IMessageWithMetadata {
  meta: IMetadata;
  message: IGenericRequest;
}
