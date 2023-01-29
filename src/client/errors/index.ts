import {EResponseType} from 'types/EResponseType';
import {IErrorResponse} from 'types/responses/IErrorResponse';

export const REQUEST_TIMED_OUT = (id: string): IErrorResponse => {
  return {
    id,
    type: EResponseType.ERROR,
    updatedAt: 0,
    error: 'Timeout while waiting for response',
  };
};
