export class Singleton {
  private static instance: Singleton;

  public static getInstance<T>(): T {
    if (!this.instance) this.instance = new this();
    return this.instance as T;
  }
}
