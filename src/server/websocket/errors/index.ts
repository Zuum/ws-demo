import {EResponseType} from 'types/EResponseType';
import {IErrorResponse} from 'types/responses/IErrorResponse';

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
