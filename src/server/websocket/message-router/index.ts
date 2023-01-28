import {ERequestType} from 'server/websocket/types/ERequestType';
import {countSubscribers} from 'server/websocket/message-router/controllers/count-subscribers';
import {subscribe} from 'server/websocket/message-router/controllers/subscribe';
import {unsubscribe} from 'server/websocket/message-router/controllers/unsubscribe';
import {IGenericResponse} from 'server/websocket/types/IGenericResponse';
import {IMessageWithMetadata} from 'server/websocket/types/IMessageWithMetadata';
import {METHOD_NOT_FOUND, UNKNOWN_ERROR} from 'server/websocket/errors';
import {Waiter} from '../helpers/waiter';

const messageTypeToHandler = {
  [ERequestType.COUNT_SUBSCRIBERS]: countSubscribers,
  [ERequestType.SUBSCRIBE]: subscribe,
  [ERequestType.UNSUBSCRIBE]: unsubscribe,
};

export const processMessage = async (
  params: IMessageWithMetadata
): Promise<IGenericResponse> => {
  const controller = messageTypeToHandler[params.message.type];
  if (!controller) {
    return METHOD_NOT_FOUND();
  }
  try {
    const result: IGenericResponse = await controller(params);
    await Waiter.wait(params.message.type);
    return result;
  } catch (error) {
    console.error(error);
    return UNKNOWN_ERROR();
  }
};
