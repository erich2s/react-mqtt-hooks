"use client";
import { useEffect, useMemo, useState } from "react";
import { MqttCache } from "../internals/mqtt-cache";
import useMqttClient from "./use-mqtt-client";

export default function useTopics(topics: string[]) {
  const mqttClient = useMqttClient();
  const cache = MqttCache.getInstance();

  const normalizedTopics = useMemo(() => [...new Set(topics)].sort(), [topics]);

  // get data from cache when initializing
  const [dataMap, setDataMap] = useState<Record<string, any>>(() => {
    return normalizedTopics.reduce((acc, topic) => {
      const cachedData = cache.getData(topic);
      if (cachedData !== undefined) {
        acc[topic] = cachedData;
      }
      return acc;
    }, {} as Record<string, any>);
  });

  useEffect(() => {
    if (!mqttClient || normalizedTopics.length === 0)
      return;

    normalizedTopics.forEach((topic) => {
      const subscribersCount = cache.subscribe(topic);
      if (subscribersCount === 1) {
        mqttClient.subscribe(topic);
      }
    });

    const handleDataUpdate = (updatedTopic: string, newData: any) => {
      if (normalizedTopics.includes(updatedTopic)) {
        setDataMap(prev => ({ ...prev, [updatedTopic]: newData }));
      }
    };

    normalizedTopics.forEach((topic) => {
      cache.addObserver(topic, (data: any) => handleDataUpdate(topic, data));
    });

    return () => {
      normalizedTopics.forEach((topic) => {
        cache.removeObserver(topic, handleDataUpdate);
        if (cache.unsubscribe(topic)) {
          mqttClient.unsubscribe(topic);
        }
      });
    };
  }, [mqttClient, normalizedTopics, cache]);

  return dataMap;
}
