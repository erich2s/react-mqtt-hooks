export type MqttStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "disconnecting"
  | "reconnecting"
  | "offline"
  | "error"
  | "end";

export type GlobalState = Map<
  string,
  { cache: Buffer | null; callbacks: (() => void)[] }
>;
