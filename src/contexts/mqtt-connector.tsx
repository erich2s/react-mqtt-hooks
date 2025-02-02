"use client";
import type { IClientOptions, MqttClient } from "mqtt";
import mqtt from "mqtt";
import { useEffect, useState } from "react";
import { MqttContext } from "./mqtt-context";

type MqttConnectorProps = {
  children: React.ReactNode;
  url: string;
  options: IClientOptions;
};

export function MqttConnector({ children, url, options }: MqttConnectorProps) {
  const [mqttClient, setMqttClient] = useState<MqttClient | null>(null);
  useEffect(() => {
    const client = mqtt.connect(url, options);
    setMqttClient(client);
    return () => {
      client.end();
    };
  }, [url, options]);
  return (
    <MqttContext.Provider value={mqttClient}>
      {mqttClient && children}
    </MqttContext.Provider>
  );
}
