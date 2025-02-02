"use client";
import type { MqttClientType } from "../contexts/mqtt-context";
import { useContext } from "react";
import { MqttContext } from "../contexts/mqtt-context";

export default function useMqttClient(): MqttClientType {
  const mqttClient = useContext(MqttContext);
  return mqttClient;
}
