import {ERequestType} from 'types/ERequestType';
import {countSubscribers} from 'server/websocket/message-router/controllers/count-subscribers';
import {subscribe} from 'server/websocket/message-router/controllers/subscribe';
import {unsubscribe} from 'server/websocket/message-router/controllers/unsubscribe';
import {IGenericResponse} from 'types/IGenericResponse';
import {IMessageWithMetadata} from 'server/websocket/types/IMessageWithMetadata';
import {METHOD_NOT_FOUND, UNKNOWN_ERROR} from 'server/websocket/errors';
import {Waiter} from 'server/websocket/helpers/waiter';
import {IController} from 'server/websocket/types/IController';

const messageTypeToHandler: Map<ERequestType, IController> = new Map<
  ERequestType,
  IController
>([
  [ERequestType.UNSUBSCRIBE, unsubscribe],
  [ERequestType.SUBSCRIBE, subscribe],
  [ERequestType.COUNT_SUBSCRIBERS, countSubscribers],
]);

export const processMessage = async (
  params: IMessageWithMetadata
): Promise<IGenericResponse> => {
  const controller = messageTypeToHandler.get(params.message.type);
  if (!controller) {
    return METHOD_NOT_FOUND(params.message.id);
  }
  try {
    const result: IGenericResponse = await controller(params);
    result.id = params.message.id;
    await Waiter.wait(params.message.type);
    return result;
  } catch (error) {
    console.error(error);
    return UNKNOWN_ERROR(params.message.id);
  }
};
