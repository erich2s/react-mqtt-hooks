import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Radio } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useMemo, useState } from "react";
import { MqttConnector, useMqttClient, useTopic, useTopics } from "react-mqtt-hooks";

function App() {
  return (
    <MqttConnector
      url="ws://localhost:8083/mqtt"
      options={{
        keepalive: 2,
        clientId: `rmh-${nanoid(3)}`,
        username: "react-mqtt-hooks",
        password: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc19zdXBlcnVzZXIiOnRydWUsImlhdCI6MTczMTQ5ODUxMiwiZXhwIjo0ODg3MjU4NTEyfQ.zMgveHMqLCjGn7v8yTddDBuJh2I2HcEjQ6m-g-O2guk",
      }}
    >
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">React MQTT Hooks Demo</h1>
          <ConnectionStatus />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <SingleTopicCard topic="TRS/AAAAAAAAAAAA" />
          <SingleTopicCard topic="chat" />
          <SingleTopicCard topic="chat" />
          <MultipleTopicsCard />
        </div>
      </div>
    </MqttConnector>
  );
}

function ConnectionStatus() {
  const client = useMqttClient();
  const [status, setStatus] = useState("connecting");
  client?.on("connect", () => setStatus("connected"));
  client?.on("reconnect", () => setStatus("reconnecting"));
  client?.on("disconnect", () => setStatus("disconnected"));
  client?.on("close", () => setStatus("closed"));
  console.log("status:", status);

  switch (status) {
    case "connecting":
      return (
        <Badge className="text-xs">
          连接中
        </Badge>
      );
    case "connected":
      return (
        <Badge className="text-xs">
          已连接
        </Badge>
      );
    case "reconnecting":
      return (
        <Badge className="text-xs">
          重连中
        </Badge>
      );
    case "disconnected":
      return (
        <Badge className="text-xs">
          已断开
        </Badge>
      );
    case "closed":
      return (
        <Badge className="text-xs">
          已关闭
        </Badge>
      );
    default:
      return null;
  }
}

function SingleTopicCard({ topic }: { topic: string }) {
  const message = useTopic(topic);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">单话题订阅</CardTitle>
        <Radio className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">话题</Badge>
            <span className="text-sm font-mono">{topic}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-2">收到的消息:</p>
            <pre className="text-sm overflow-auto max-h-32">
              {JSON.stringify(message, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MultipleTopicsCard() {
  const topicsArr = useMemo(() => ["TRS/AAAAAAAAAAAA", "TRS/BBBBBBBBBBBB"], []);
  const messages = useTopics(topicsArr);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">多话题订阅</CardTitle>
        <Layers className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {topicsArr.map(topic => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-2">收到的消息:</p>
            <pre className="text-sm overflow-auto max-h-32">
              {JSON.stringify(messages, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default App;
