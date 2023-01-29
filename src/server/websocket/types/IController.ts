import {IGenericResponse} from 'types/IGenericResponse';
import {IMessageWithMetadata} from 'server/websocket/types/IMessageWithMetadata';

export interface IController {
  (params: IMessageWithMetadata): Promise<IGenericResponse>;
}
