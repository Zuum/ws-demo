import {ERequestType} from 'types/ERequestType';

export class Waiter {
  private static subscribeWaitMs = 0;
  private static unsubscribeWaitMs = 0;

  public static setSubscribeWait(ms: number): void {
    Waiter.subscribeWaitMs = ms;
  }

  public static setUnsubscribeWait(ms: number): void {
    Waiter.unsubscribeWaitMs = ms;
  }

  public static async wait(type: ERequestType): Promise<void> {
    let msDelay = 0;
    switch (type) {
      case ERequestType.SUBSCRIBE:
        msDelay = Waiter.subscribeWaitMs;
        break;
      case ERequestType.UNSUBSCRIBE:
        msDelay = Waiter.unsubscribeWaitMs;
        break;
      default:
        return;
    }
    await Waiter.waitInternal(msDelay);
  }

  private static async waitInternal(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
}
