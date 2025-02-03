import { useEffect, useState } from "react";
import { useMqttClient } from "react-mqtt-hooks";
import { Badge } from "./ui/badge";

export default function ConnectionStatus() {
  const client = useMqttClient();
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    if (!client)
      return;

    function onConnect() {
      setStatus("connected");
    }
    function onReconnect() {
      setStatus("reconnecting");
    }
    function onDisconnect() {
      setStatus("disconnected");
    }
    function onClose() {
      setStatus("closed");
    }

    client.on("connect", onConnect);
    client.on("reconnect", onReconnect);
    client.on("disconnect", onDisconnect);
    client.on("close", onClose);
    return () => {
      client.off("connect", onConnect);
      client.off("reconnect", onReconnect);
      client.off("disconnect", onDisconnect);
      client.off("close", onClose);
    };
  }, [client]);

  const getStatusStyles = () => {
    const baseStyles = "text-xs font-medium inline-flex items-center gap-2";
    switch (status) {
      case "connecting":
        return `${baseStyles} bg-yellow-200 hover:bg-yellow-300 text-yellow-800`;
      case "connected":
        return `${baseStyles} bg-green-200 hover:bg-green-300 text-green-800`;
      case "reconnecting":
        return `${baseStyles} bg-blue-200 hover:bg-blue-300 text-blue-800`;
      case "disconnected":
        return `${baseStyles} bg-red-200 hover:bg-red-300 text-red-800`;
      case "closed":
        return `${baseStyles} bg-gray-200 hover:bg-gray-300 text-gray-800`;
      default:
        return baseStyles;
    }
  };

  const getDotColor = () => {
    switch (status) {
      case "connecting":
        return "bg-yellow-500";
      case "connected":
        return "bg-green-500";
      case "reconnecting":
        return "bg-blue-500";
      case "disconnected":
        return "bg-red-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connecting":
        return "Connecting";
      case "connected":
        return "Connected";
      case "reconnecting":
        return "Reconnecting";
      case "disconnected":
        return "Disconnected";
      case "closed":
        return "Closed";
      default:
        return null;
    }
  };

  if (!status)
    return null;

  return (
    <Badge className={getStatusStyles()}>
      <div className={`w-2 h-2 rounded-full ${getDotColor()}`} />
      {getStatusText()}
    </Badge>
  );
}
