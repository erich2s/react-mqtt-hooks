export type CacheItem<T> = {
  data: T;
  subscribers: number;
};

// Global cache for MQTT messages
export class MqttCache {
  private static instance: MqttCache;
  private cache = new Map<string, CacheItem<any>>();

  private constructor() {}

  static getInstance(): MqttCache {
    if (!MqttCache.instance) {
      MqttCache.instance = new MqttCache();
    }
    return MqttCache.instance;
  }

  getData<T>(topic: string) {
    return this.cache.get(topic)?.data as T | undefined;
  }

  setData<T>(topic: string, data: T) {
    const item = this.cache.get(topic);
    if (item) {
      item.data = data;
    }
    else {
      this.cache.set(topic, {
        data,
        subscribers: 1,
      });
    }
  }

  subscribe(topic: string) {
    const item = this.cache.get(topic);
    if (item) {
      return ++item.subscribers;
    }
    else {
      this.cache.set(topic, {
        data: undefined,
        subscribers: 1,
      });
      return 1;
    }
  }

  unsubscribe(topic: string): boolean {
    const item = this.cache.get(topic);
    if (item) {
      item.subscribers--;
      if (item.subscribers <= 0) {
        this.cache.delete(topic);
        return true;
      }
    }
    return false;
  }
}
