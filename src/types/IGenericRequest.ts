import {ERequestType} from 'types/ERequestType';

export interface IGenericRequest {
  type: ERequestType;
  id: string;
}
