import { useState } from "react";
import { _cache } from "react-mqtt-hooks";
import SingleTopicCard from "./single-topic-card";
import { Button } from "./ui/button";

export default function Demo() {
  const [show, setShow] = useState(false);
  function printCache() {
    console.log(_cache);
  }
  return (
    <section className="space-y-2">
      <p>Component mount/unmount should get the data from cache.</p>
      <Button onClick={() => setShow(!show)} variant="outline" size="lg">
        {show ? "Hide" : "Show"}
      </Button>
      <Button onClick={printCache} size="lg" variant="secondary" className="ml-2">
        Print Cache
      </Button>

      {show && <SingleTopicCard topic="chat/3" />}
    </section>
  );
}
