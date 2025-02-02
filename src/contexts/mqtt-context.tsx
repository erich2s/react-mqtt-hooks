import type { MqttClient } from "mqtt";
import { createContext } from "react";

export const MqttContext = createContext<MqttClient | null>(null);
