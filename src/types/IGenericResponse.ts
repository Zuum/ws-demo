import {EResponseType} from 'types/EResponseType';

export interface IGenericResponse {
  type: EResponseType;
  updatedAt: number;
  // TODO: probably should structure it better
  // then just making id optional
  id?: string;
}
