import { Layers } from "lucide-react";
import { useMemo } from "react";
import { useTopics } from "react-mqtt-hooks";
import MessageDisplay from "./message-display";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function MultiTopicsCard() {
  const topicsArr = useMemo(() => ["chat/1", "chat/2"], []);
  const messages = useTopics(topicsArr);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">Multiple Topics Subscription</CardTitle>
        <Layers className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {topicsArr.map(topic => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
          <MessageDisplay label="Received Messages" message={messages} />
        </div>
      </CardContent>
    </Card>
  );
}
