import {StoreSingleton} from 'server/store';
import {EResponseType} from 'types/EResponseType';
import {IMessageWithMetadata} from 'server/websocket/types/IMessageWithMetadata';
import {IUnsubscribeResponse} from 'types/responses/IUnsubscribeResponse';
import {IController} from 'server/websocket/types/IController';

export const unsubscribe: IController = async (
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
