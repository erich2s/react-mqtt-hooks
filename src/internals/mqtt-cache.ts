/* eslint-disable ts/no-unsafe-function-type */
import type { MqttClient } from "mqtt";
import type { Buffer } from "node:buffer";
import { parseMessage } from "./utils";

export type CacheItem<T> = {
  data: T;
  subscribers: number;
};

// Global cache for MQTT messages
export class MqttCache {
  private static instance: MqttCache;
  private cache = new Map<string, CacheItem<any>>();
  private observers: Map<string, Set<Function>> = new Map();
  private mqttClient: MqttClient | null = null;
  private customParser: ((message: Buffer) => any) | undefined = undefined;

  static getInstance(): MqttCache {
    if (!MqttCache.instance) {
      MqttCache.instance = new MqttCache();
    }
    return MqttCache.instance;
  }

  setClient(client: MqttClient | null) {
    this.mqttClient = client;
    if (client) {
      this.setupMessageListener();
    }
  }

  setCustomParser(parser: ((message: Buffer) => any) | undefined) {
    this.customParser = parser;
  }

  private setupMessageListener() {
    if (!this.mqttClient) {
      return;
    }
    this.mqttClient.on("message", (topic: string, message: Buffer) => {
      const parsedMsg = this.customParser ? this.customParser(message) : parseMessage(message);
      this.setData(topic, parsedMsg);
      this.notifyObservers(topic, parsedMsg);
    });
  }

  private notifyObservers(topic: string, data: any) {
    const observers = this.observers.get(topic);
    if (observers) {
      observers.forEach(callback => callback(data));
    }
  }

  addObserver(topic: string, callback: Function) {
    if (!this.observers.has(topic)) {
      this.observers.set(topic, new Set());
    }
    this.observers.get(topic)?.add(callback);
  }

  removeObserver(topic: string, callback: Function) {
    const observers = this.observers.get(topic);
    if (observers) {
      observers.delete(callback);
      if (observers.size === 0) {
        this.observers.delete(topic);
      }
    }
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
