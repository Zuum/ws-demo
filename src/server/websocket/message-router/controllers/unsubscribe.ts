import {StoreSingleton} from 'server/store';
import {IGenericResponse} from 'server/websocket/types/IGenericResponse';
import {EResponseType} from 'server/websocket/types/EResponseType';
import {IMessageWithMetadata} from 'server/websocket/types/IMessageWithMetadata';

interface IUnsubscribeResponse extends IGenericResponse {
  status: string;
}

export const unsubscribe = async (
  params: IMessageWithMetadata
): Promise<IUnsubscribeResponse> => {
  const timestamp = StoreSingleton.getInstance().unsubscribeAndTimestamp(
    params.meta.id
  );
  return {
    type: EResponseType.UNSUBSCRIBE,
    status: 'Unsubscribed',
    updatedAt: timestamp,
  };
};
