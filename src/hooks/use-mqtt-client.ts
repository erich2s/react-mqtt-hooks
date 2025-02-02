"use client";
import { useContext } from "react";
import { MqttContext } from "../contexts/mqtt-context";

export default function useMqttClient() {
  const mqttClient = useContext(MqttContext);
  if (!mqttClient) {
    throw new Error("useMqttClient must be used within an MqttProvider");
  }
  return mqttClient;
}
