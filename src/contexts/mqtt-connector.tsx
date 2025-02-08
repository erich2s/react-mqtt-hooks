"use client";
import type { IClientOptions } from "mqtt";
import type { Buffer } from "node:buffer";
import type { MqttClientType } from "./mqtt-context";
import mqtt from "mqtt";
import { useEffect, useState } from "react";
import { MqttCache } from "../internals/mqtt-cache";
import { MqttContext } from "./mqtt-context";

type MqttConnectorProps = {
  children: React.ReactNode;
  url: string;
  options?: IClientOptions;
  customParser?: (message: Buffer) => any;
};

export function MqttConnector({ children, url, options, customParser }: MqttConnectorProps) {
  const [mqttClient, setMqttClient] = useState<MqttClientType>(null);
  const cache = MqttCache.getInstance();
  useEffect(() => {
    const client = mqtt.connect(url, options);
    setMqttClient(client);
    client.on("connect", () => {
      cache.setClient(client);
      cache.setCustomParser(customParser);
    });

    return () => {
      cache.setClient(null);
      client.end();
    };
  }, [url, options, cache, customParser]);
  return (
    // disable this rule to make it compatible with React 18
    // eslint-disable-next-line react/no-context-provider
    <MqttContext.Provider value={mqttClient}>
      {children}
    </MqttContext.Provider>
  );
}
