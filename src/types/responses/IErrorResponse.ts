import {IGenericResponse} from 'types/IGenericResponse';

export interface IErrorResponse extends IGenericResponse {
  error: string;
}
