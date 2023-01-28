import {StoreSingleton} from 'server/store';
import {IGenericResponse} from 'server/websocket/types/IGenericResponse';
import {EResponseType} from 'server/websocket/types/EResponseType';
import {IMessageWithMetadata} from 'server/websocket/types/IMessageWithMetadata';

interface ICountSubscribersResponse extends IGenericResponse {
  count: number;
}

export const countSubscribers = async (
  params: IMessageWithMetadata
): Promise<ICountSubscribersResponse> => {
  const count = StoreSingleton.getInstance().countConnections();
  return {
    type: EResponseType.COUNT_SUBSCRIBERS,
    count,
    updatedAt: Date.now(),
  };
};
