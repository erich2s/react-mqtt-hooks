import { useContext } from "react";
import { mqttConnectorContext } from "../core/mqtt-connector";

export function useMqttContext() {
  const ctx = useContext(mqttConnectorContext);
  if (!ctx) {
    throw new Error("useMqttContext must be used within a MqttConnector");
  }
  return ctx;
}
