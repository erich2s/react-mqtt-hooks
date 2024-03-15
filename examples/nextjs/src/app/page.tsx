"use client";
import { useMqttContext, useTopic } from "react-mqtt-hooks";

export default function Page() {
  const { status } = useMqttContext();
  return (
    <div className="flex flex-col items-center">
      <h1 className="font-bold">Mqtt status: {status}</h1>
      <div className="flex gap-2 flex-wrap">
        <TopicMsg topic="chat" />
        <TopicMsg topic="chat" />
        <TopicMsg topic="chat" />
        <TopicMsg topic="chat" />
      </div>
    </div>
  );
}

function TopicMsg({ topic }: { topic: string }) {
  const msg = useTopic(topic);
  return (
    <div className="p-4 bg-slate-200 rounded-md my-2">
      <h2 className="font-bold text-xl">topic:{topic}</h2>
      <p>{msg?.toString()}</p>
    </div>
  );
}
