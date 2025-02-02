"use client";
import type { IClientOptions } from "mqtt";
import type { MqttClientType } from "./mqtt-context";
import mqtt from "mqtt";
import { useEffect, useState } from "react";
import { MqttContext } from "./mqtt-context";

type MqttConnectorProps = {
  children: React.ReactNode;
  url: string;
  options?: IClientOptions;
};

export function MqttConnector({ children, url, options }: MqttConnectorProps) {
  const [mqttClient, setMqttClient] = useState<MqttClientType>(null);
  useEffect(() => {
    const client = mqtt.connect(url, options);
    setMqttClient(client);

    return () => {
      client.end();
    };
  }, [url, options]);
  return (
    <MqttContext.Provider value={mqttClient}>
      {children}
    </MqttContext.Provider>
  );
}
