import { useSyncExternalStore } from "react";
import { globalState } from "../core/global-state";
import { type MqttClient } from "mqtt";
import { useMqttConnector } from "./use-mqtt-connector";

export function useTopic(topic: string) {
  const ctx = useMqttConnector();
  if (!ctx) {
    throw new Error("useTopic must be used within a MqttConnector");
  }
  const { client } = ctx;
  const message = useSyncExternalStore<Buffer | null>(
    (cb) => subscribeToTopic(client, topic, cb),
    () => getSanpshotForTopic(topic),
    () => getServerSnapshotForTopic(topic),
  );
  return message;
}

function subscribeToTopic(
  client: MqttClient | null | undefined,
  topic: string,
  callback: () => void,
) {
  if (!client) {
    // Mqtt client not ready yet
    return () => {};
  }
  const topicItem = globalState.get(topic);
  if (topicItem) {
    topicItem.callbacks.push(callback);
  } else {
    globalState.set(topic, { cache: null, callbacks: [callback] });
    client.subscribe(topic);
  }
  return () => {
    const topicItem = globalState.get(topic);
    if (topicItem) {
      topicItem.callbacks = topicItem.callbacks.filter((cb) => cb !== callback);
      // TODO: unsubscribe if no more callbacks, and delete the topic from globalState
    }
  };
}
function getSanpshotForTopic(topic: string) {
  const topicItem = globalState.get(topic);
  return topicItem ? topicItem.cache : null;
}
function getServerSnapshotForTopic(_topic: string) {
  // TODO: implement this
  return null;
}
