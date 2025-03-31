/* eslint-disable ts/no-unsafe-function-type */
import type { MqttClient } from "mqtt";
import type { Buffer } from "node:buffer";
import { parseMessage } from "./utils";

export type CacheItem<T> = {
  data: T;
  subscribers: Map<string, Function>; // subscriberId: callback
  lastUpdated: string | null;
};

// Global cache for MQTT messages
export class MqttCache {
  private static instance: MqttCache;
  private cache = new Map<string, CacheItem<any>>();
  private mqttClient: MqttClient | null = null;
  private customParser: ((message: Buffer) => any) | undefined = undefined;
  private activeSubscriptions = new Set<string>();

  static getInstance(): MqttCache {
    if (!MqttCache.instance) {
      MqttCache.instance = new MqttCache();
    }
    return MqttCache.instance;
  }

  setClient(client: MqttClient | null) {
    const previousClient = this.mqttClient;
    this.mqttClient = client;

    // Clean up previous client
    if (previousClient) {
      previousClient.removeAllListeners("message");
    }

    if (client) {
      this.setupMessageListener();

      // Resubscribe to all active topics when client changes or reconnects
      this.resubscribeToActiveTopics();

      client.on("connect", () => {
        this.resubscribeToActiveTopics();
      });
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
      this.notifySubscribers(topic, parsedMsg);
    });
  }

  private resubscribeToActiveTopics() {
    if (!this.mqttClient || !this.mqttClient.connected)
      return;

    this.activeSubscriptions.forEach((topic) => {
      this.mqttClient?.subscribe(topic);
    });
  }

  private notifySubscribers(topic: string, data: any) {
    const cacheItem = this.cache.get(topic);
    if (cacheItem && cacheItem.subscribers.size > 0) {
      cacheItem.subscribers.forEach(callback => callback(data));
    }
  }

  getData<T>(topic: string) {
    return this.cache.get(topic)?.data as T | undefined;
  }

  private setData<T>(topic: string, data: T) {
    const item = this.cache.get(topic);
    if (item) {
      item.data = data;
      item.lastUpdated = new Date().toLocaleString();
    }
    else {
      this.cache.set(topic, {
        data,
        subscribers: new Map(),
        lastUpdated: new Date().toLocaleString(),
      });
    }
  }

  subscribe(topic: string, callback: Function, subscriberId: string): number {
    if (!this.cache.has(topic)) {
      this.cache.set(topic, {
        data: undefined,
        subscribers: new Map(),
        lastUpdated: null,
      });
    }

    const item = this.cache.get(topic)!;
    item.subscribers.set(subscriberId, callback);

    // If this is the first subscriber, subscribe to MQTT topic
    if (item.subscribers.size === 1) {
      this.activeSubscriptions.add(topic);
      if (this.mqttClient?.connected) {
        this.mqttClient.subscribe(topic);
      }
    }

    return item.subscribers.size;
  }

  unsubscribe(topic: string, subscriberId: string): boolean {
    const item = this.cache.get(topic);
    if (!item)
      return false;

    item.subscribers.delete(subscriberId);

    // If no subscribers left, unsubscribe from MQTT topic
    if (item.subscribers.size === 0) {
      this.activeSubscriptions.delete(topic);

      if (this.mqttClient?.connected) {
        this.mqttClient.unsubscribe(topic);
        return true;
      }
    }

    return false;
  }
}
