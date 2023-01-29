import {StoreSingleton} from 'server/store';
import {EResponseType} from 'types/EResponseType';
import {IMessageWithMetadata} from 'server/websocket/types/IMessageWithMetadata';
import {ICountSubscribersResponse} from 'types/responses/ICountSubscribersResponse';
import {IController} from 'server/websocket/types/IController';

export const countSubscribers: IController = async (
  params: IMessageWithMetadata
): Promise<ICountSubscribersResponse> => {
  const count = StoreSingleton.getInstance().countConnections();
  return {
    type: EResponseType.COUNT_SUBSCRIBERS,
    count,
    updatedAt: Date.now(),
  };
};
