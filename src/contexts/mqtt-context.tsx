import type { MqttClient } from "mqtt";
import { createContext } from "react";

export type MqttClientType = MqttClient | null;
export const MqttContext = createContext<MqttClientType>(null);
