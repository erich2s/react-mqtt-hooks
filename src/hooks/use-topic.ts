"use client";
import { useEffect, useState } from "react";
import { MqttCache } from "../internals/mqtt-cache";
import useMqttClient from "./use-mqtt-client";

export default function useTopic<T = any>(topic: string | null) {
  const mqttClient = useMqttClient();
  const cache = MqttCache.getInstance();
  const [data, setData] = useState<T | undefined>(() => {
    // get data from cache
    return topic ? cache.getData<T>(topic) : undefined;
  });

  useEffect(() => {
    if (!mqttClient || !topic)
      return;

    // only subscribe to the topic if there are no other subscribers
    const subscribersCount = cache.subscribe(topic);
    if (subscribersCount === 1) {
      mqttClient.subscribe(topic);
    }

    // when multiple components subscribe to the same topic, return the data from the cache
    const cachedData = cache.getData<T>(topic);
    if (cachedData) {
      setData(cachedData);
    }

    const handleDataUpdate = (newData: T) => {
      setData(newData);
    };

    cache.addObserver(topic, handleDataUpdate);

    return () => {
      cache.removeObserver(topic, handleDataUpdate);
      if (cache.unsubscribe(topic)) {
        mqttClient.unsubscribe(topic);
      }
    };
  }, [mqttClient, topic, cache]);

  return data;
}
