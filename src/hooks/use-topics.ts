"use client";
import type { Buffer } from "node:buffer";
import { useEffect, useMemo, useState } from "react";
import { MqttCache } from "../internals/mqtt-cache";
import { parseMessage } from "../internals/utils";
import useMqttClient from "./use-mqtt-client";

export default function useTopics(topics: string[]) {
  const mqttClient = useMqttClient();
  const cache = MqttCache.getInstance();

  const normalizedTopics = useMemo(() => [...new Set(topics)].sort(), [topics]);

  // get data from cache when initializing
  const [dataMap, setDataMap] = useState(() => {
    return normalizedTopics.reduce((acc, topic) => {
      const cachedData = cache.getData(topic);
      if (cachedData !== undefined) {
        acc[topic] = cachedData;
      }
      return acc;
    }, {} as Record<string, any>);
  });

  useEffect(() => {
    if (!mqttClient)
      return;

    // skip subscribing when there is no topic
    if (normalizedTopics.length === 0)
      return;

    normalizedTopics.forEach((topic) => {
      const cachedData = cache.getData(topic);
      // update dataMap if there is cached data
      if (cachedData) {
        setDataMap(prev => ({ ...prev, [topic]: cachedData }));
      }
      // subscribe to topic when there is no subscriber in cache
      else {
        const subscribersCount = cache.subscribe(topic);
        if (subscribersCount === 1) {
          mqttClient.subscribe(topic);
        }
      }
    });

    // handle incoming messages
    function handleMessage(receivedTopic: string, message: Buffer) {
      if (!normalizedTopics.includes(receivedTopic))
        return;

      const parsedMsg = parseMessage(message);
      cache.setData(receivedTopic, parsedMsg);
      setDataMap(prev => ({ ...prev, [receivedTopic]: parsedMsg }));
    }
    mqttClient.on("message", handleMessage);

    return () => {
      mqttClient.off("message", handleMessage);

      // unsubscribe when there is no subscriber in cache
      normalizedTopics.forEach((topic) => {
        if (cache.unsubscribe(topic)) {
          mqttClient.unsubscribe(topic);
        }
      });
    };
  }, [mqttClient, normalizedTopics, cache]);

  return dataMap;
}
