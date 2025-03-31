"use client";
import { useEffect, useId, useMemo, useState } from "react";
import { MqttCache } from "../internals/mqtt-cache";
import useMqttClient from "./use-mqtt-client";

export default function useTopics(topics: string[]) {
  const mqttClient = useMqttClient();
  const cache = MqttCache.getInstance();
  const baseObserverId = useId(); // Base unique ID for this component instance

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
    if (normalizedTopics.length === 0)
      return;

    // Initial data refresh
    const initialData = normalizedTopics.reduce((acc, topic) => {
      const cachedData = cache.getData(topic);
      if (cachedData !== undefined) {
        acc[topic] = cachedData;
      }
      return acc;
    }, {} as Record<string, any>);

    if (Object.keys(initialData).length > 0) {
      setDataMap(prev => ({ ...prev, ...initialData }));
    }

    // Subscribe to all topics
    normalizedTopics.forEach((topic) => {
      const observerId = `${baseObserverId}-${topic}`;
      const handleDataUpdate = (newData: any) => {
        setDataMap(prev => ({ ...prev, [topic]: newData }));
      };

      // Combined subscribe and addObserver
      cache.subscribe(topic, handleDataUpdate, observerId);
    });

    return () => {
      normalizedTopics.forEach((topic) => {
        // Combined unsubscribe and removeObserver
        cache.unsubscribe(topic, `${baseObserverId}-${topic}`);
      });
    };
  }, [mqttClient, normalizedTopics, cache, baseObserverId]);

  return dataMap;
}
