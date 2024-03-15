import type { MqttClient } from "mqtt";
import mqtt from "mqtt";
import {
  createContext,
  createElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { globalState } from "./global-state";
import { type MqttStatus } from "../types";

export const mqttConnectorContext = createContext<{
  client: MqttClient | null;
  status: MqttStatus;
}>({ client: null, status: "connecting" });

export function MqttConnector({
  url,
  options,
  children,
}: {
  url: string;
  options?: mqtt.IClientOptions;
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [status, setStatus] = useState<MqttStatus>("connecting");
  const effectRan = useRef(false);
  useEffect(() => {
    if (!client && !effectRan.current) {
      effectRan.current = true;
      const _client = mqtt.connect(url, options);
      _client.on("connect", () => {
        console.log("MQTT connected");
        setClient(_client);
        setStatus("connected");
      });
      _client.on("error", (error) => {
        console.error("MQTT error:", error);
        setStatus("error");
      });
      _client.on("end", () => {
        setStatus("end");
      });
      _client.on("reconnect", () => {
        console.log("MQTT reconnecting");
        setStatus("reconnecting");
      });
      _client.on("offline", () => {
        setStatus("offline");
      });
      _client.on("disconnect", () => {
        setStatus("disconnected");
      });
      _client.on("close", () => {
        setStatus("disconnected");
      });

      _client.on("message", (topic, message) => {
        const item = globalState.get(topic);
        if (item) {
          item.cache = message;
          // Call all subscribers, force re-render
          item.callbacks.forEach((cb) => cb());
        }
      });
    }
  }, [options, url, client]);

  useEffect(() => {
    return () => {
      if (client) {
        client.end();
      }
    };
  }, [client]);

  return createElement(
    mqttConnectorContext.Provider,
    { value: { client, status } },
    children,
  );
}
