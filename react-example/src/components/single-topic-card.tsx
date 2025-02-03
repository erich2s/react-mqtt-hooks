import { Radio } from "lucide-react";
import { useTopic } from "react-mqtt-hooks";
import MessageDisplay from "./message-display";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function SingleTopicCard({ topic }: { topic: string }) {
  const message = useTopic(topic);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">Single Topic Subscription</CardTitle>
        <Radio className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Badge variant="outline" className="text-xs">
            {topic}
          </Badge>
          <MessageDisplay label="Received Message" message={message} />
        </div>
      </CardContent>
    </Card>
  );
}
