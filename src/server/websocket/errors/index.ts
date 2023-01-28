import {EResponseType} from 'server/websocket/types/EResponseType';
import {IGenericResponse} from 'server/websocket/types/IGenericResponse';

interface IErrorResponse extends IGenericResponse {
  error: string;
}

export const JSON_PARSE_ERROR = (): IErrorResponse => {
  return {
    type: EResponseType.ERROR,
    error: 'Bad formatted payload, non JSON',
    updatedAt: Date.now(),
  };
};

export const METHOD_NOT_FOUND = (): IErrorResponse => {
  return {
    type: EResponseType.ERROR,
    error: 'Requested method not implemented',
    updatedAt: Date.now(),
  };
};

export const UNKNOWN_ERROR = (): IErrorResponse => {
  return {
    type: EResponseType.ERROR,
    error: 'Server encountered unexpected error while handling request',
    updatedAt: Date.now(),
  };
};
