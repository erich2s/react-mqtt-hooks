"use client";
import type { Buffer } from "node:buffer";
import { useEffect, useState } from "react";
import { MqttCache } from "../internals/mqtt-cache";
import { parseMessage } from "../internals/utils";
import useMqttClient from "./use-mqtt-client";

export default function useTopic<T = any>(topic: string | null) {
  const mqttClient = useMqttClient();
  const cache = MqttCache.getInstance();
  const [data, setData] = useState<T | undefined>(() => {
    // get data from cache
    return topic ? MqttCache.getInstance().getData<T>(topic) : undefined;
  });

  useEffect(() => {
    // skip sub if topic is null
    if (!topic)
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

    function handleMessage(receivedTopic: string, message: Buffer) {
      if (receivedTopic !== topic)
        return;

      const parsedMsg = parseMessage<T>(message);
      cache.setData(topic, parsedMsg);
      setData(parsedMsg);
    }

    mqttClient.on("message", handleMessage);

    return () => {
      mqttClient.off("message", handleMessage);
      if (cache.unsubscribe(topic)) {
        mqttClient.unsubscribe(topic);
      }
    };
  }, [cache, mqttClient, topic]);

  return data;
}
