/* eslint-disable ts/no-unsafe-function-type */
import type { MqttClient } from "mqtt";
import type { Buffer } from "node:buffer";
import { parseMessage } from "./utils";

export type CacheItem<T> = {
  data: T;
  subscribers: Map<string, Function>;
  lastUpdated: number;
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

  setData<T>(topic: string, data: T) {
    const item = this.cache.get(topic);
    if (item) {
      item.data = data;
      item.lastUpdated = Date.now();
    }
    else {
      this.cache.set(topic, {
        data,
        subscribers: new Map(),
        lastUpdated: Date.now(),
      });
    }
  }

  // Combined subscribe and addObserver
  subscribe(topic: string, callback: Function, observerId: string): number {
    if (!this.cache.has(topic)) {
      this.cache.set(topic, {
        data: undefined,
        subscribers: new Map(),
        lastUpdated: 0,
      });
    }

    const item = this.cache.get(topic)!;
    item.subscribers.set(observerId, callback);

    // If this is the first subscriber, subscribe to MQTT topic
    if (item.subscribers.size === 1) {
      this.activeSubscriptions.add(topic);
      if (this.mqttClient?.connected) {
        this.mqttClient.subscribe(topic);
      }
    }

    return item.subscribers.size;
  }

  // Combined unsubscribe and removeObserver
  unsubscribe(topic: string, observerId: string): boolean {
    const item = this.cache.get(topic);
    if (!item)
      return false;

    item.subscribers.delete(observerId);

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

  // Debug helper
  getSubscriptionStatus() {
    return {
      cacheSize: this.cache.size,
      activeSubscriptions: Array.from(this.activeSubscriptions),
      topics: Array.from(this.cache.entries()).map(([topic, item]) => ({
        topic,
        subscribers: item.subscribers.size,
        hasData: item.data !== undefined,
      })),
    };
  }
}
