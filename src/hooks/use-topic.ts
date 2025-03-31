"use client";
import { useEffect, useId, useState } from "react";
import { MqttCache } from "../internals/mqtt-cache";
import useMqttClient from "./use-mqtt-client";

export default function useTopic<T = any>(topic: string | null) {
  const mqttClient = useMqttClient();
  const cache = MqttCache.getInstance();
  const subscriberId = useId(); // Unique ID for this component instance

  const [data, setData] = useState<T | undefined>(() => {
    // get data from cache
    return topic ? cache.getData<T>(topic) : undefined;
  });

  useEffect(() => {
    if (!topic)
      return;

    const handleDataUpdate = (newData: T) => {
      setData(newData);
    };

    // Combined subscribe and addObserver
    cache.subscribe(topic, handleDataUpdate, subscriberId);

    // Check again for initial data (might have been updated since state init)
    const cachedData = cache.getData<T>(topic);
    if (cachedData !== undefined) {
      setData(cachedData);
    }

    return () => {
      // Combined unsubscribe and removeObserver
      cache.unsubscribe(topic, subscriberId);
    };
  }, [mqttClient, topic, cache, subscriberId]);

  return data;
}
