import type { Buffer } from "node:buffer";

export function parseMessage<T>(message: Buffer): T {
  try {
    return JSON.parse(message.toString()) as T;
  }
  catch {
    return message.toString() as T;
  }
}
