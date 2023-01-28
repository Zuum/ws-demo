import {ISubscriber} from 'server/store/ISubscriber';

export class StoreSingleton {
  private readonly subscribers: Map<string, ISubscriber>;
  private static instance: StoreSingleton;

  private constructor() {
    this.subscribers = new Map<string, ISubscriber>();
  }

  public static getInstance() {
    if (!StoreSingleton.instance) {
      this.instance = new StoreSingleton();
    }

    return this.instance;
  }

  public addConnection(connection: ISubscriber): void {
    this.subscribers.set(connection.id, connection);
  }

  public removeConnection(id: string): void {
    this.subscribers.delete(id);
  }

  public countConnections(): number {
    const asArray = Array.from(this.subscribers);
    const filtered = asArray.filter(e => e[1].isSubscribed);
    return filtered.length;
  }

  public subscribeAndTimestamp(id: string): number {
    const currentData = this.subscribers.get(id);
    if (!currentData) {
      throw new Error(`Subscribe requested from unregistered socket: ${id}`);
    }

    if (!currentData.isSubscribed || !currentData.subscribedAt) {
      currentData.isSubscribed = true;
      currentData.subscribedAt = currentData.subscribedAt ?? Date.now();
      delete currentData.unsubscribedAt;

      this.subscribers.set(id, currentData);
    }

    return currentData.subscribedAt;
  }

  unsubscribeAndTimestamp(id: string): number {
    const currentData = this.subscribers.get(id);
    if (!currentData) {
      throw new Error(`Unsubscribe requested from unregistered socket: ${id}`);
    }

    if (currentData.isSubscribed || !currentData.unsubscribedAt) {
      currentData.isSubscribed = false;
      currentData.unsubscribedAt = currentData.unsubscribedAt ?? Date.now();
      delete currentData.subscribedAt;

      this.subscribers.set(id, currentData);
    }

    return currentData.unsubscribedAt;
  }
}
