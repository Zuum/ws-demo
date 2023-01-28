import {EResponseType} from 'server/websocket/types/EResponseType';

export interface IGenericResponse {
  type: EResponseType;
  updatedAt: number;
}
