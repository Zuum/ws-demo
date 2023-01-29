import {StoreSingleton} from 'server/store';
import {EResponseType} from 'types/EResponseType';
import {IMessageWithMetadata} from 'server/websocket/types/IMessageWithMetadata';
import {ISubscribeResponse} from 'types/responses/ISubscribeResponse';
import {IController} from 'server/websocket/types/IController';

export const subscribe: IController = async (
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
