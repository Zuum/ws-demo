import {StoreSingleton} from 'server/store';
import {IGenericResponse} from 'server/websocket/types/IGenericResponse';
import {EResponseType} from 'server/websocket/types/EResponseType';
import {IMessageWithMetadata} from 'server/websocket/types/IMessageWithMetadata';

interface ISubscribeResponse extends IGenericResponse {
  status: string;
}

export const subscribe = async (
  params: IMessageWithMetadata
): Promise<ISubscribeResponse> => {
  const timestamp = StoreSingleton.getInstance().subscribeAndTimestamp(
    params.meta.id
  );
  return {
    type: EResponseType.SUBSCRIBE,
    status: 'Subscribed',
    updatedAt: timestamp,
  };
};
