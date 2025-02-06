import { useState } from "react";
import SingleTopicCard from "./single-topic-card";
import { Button } from "./ui/button";

export default function Demo() {
  const [show, setShow] = useState(false);
  return (
    <section className="space-y-2">

      <p>
        Component mount/unmount should get the data from cache.
      </p>
      <Button onClick={() => setShow(!show)} variant="outline" size="lg">
        {show ? "Hide" : "Show"}
      </Button>

      {show && <SingleTopicCard topic="chat/1" />}
    </section>
  );
}
