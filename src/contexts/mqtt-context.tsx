import type { MqttClient } from "mqtt";
import { createContext } from "react";

export type MqttClientType = MqttClient | null;

export const MQTT_STATUS = {
  CONNECTING: "connecting",
  DISCONNECTED: "disconnected",
  RECONNECTING: "reconnecting",
  CONNECTED: "connected",
  CLOSED: "closed",
} as const;

export const MqttContext = createContext<MqttClientType>(null);
