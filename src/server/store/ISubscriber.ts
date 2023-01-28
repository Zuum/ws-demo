export interface ISubscriber {
  id: string;
  isSubscribed?: boolean;
  unsubscribedAt?: number;
  subscribedAt?: number;
}
