<h1 align="center">
  <img src="./public/logo.svg" alt="React-Mqtt-Hooks logo"/>
  <p>React-Mqtt-Hooks</p>
</h1>

See demo here: <https://react-mqtt-hooks.vercel.app/>

## Introduction

React-Mqtt-Hooks is a library that simplifies the integration of [MQTT](https://mqtt.org/) (Message Queuing Telemetry Transport) functionality into React applications. It provides a set of custom hooks that allow developers to easily connect to an MQTT broker based on the popular [MQTT.js](https://github.com/mqttjs/MQTT.js) library.

With these hooks, you can publish messages to specific topics and subscribe to receive messages from the broker. The library seamlessly synchronizes the received MQTT messages with the state of your React functional components, enabling real-time updates and efficient data handling within your application.

## ✨ Features

- **Global Cache**: The message received from the MQTT broker is stored in a global cache, which can be accessed from any component in the application.
- **Real-time Updates**: The library automatically updates the state of your components when new messages are received from the broker.

## 📦 Installation

```bash
pnpm add react-mqtt-hooks mqtt
```

## 🚀 Quick Start

1. First, wrap your application with the `MqttConnector` component and provide the MQTT Broker URL and the [connection options](https://github.com/mqttjs/MQTT.js?tab=readme-ov-file#mqttclientstreambuilder-options).

   ```tsx
   import { MqttConnector } from "react-mqtt-hooks";

   function App() {
     return (
       <MqttConnector
         url="ws://example-broker-url/mqtt"
         options={{
           clientId: "your-client-id",
           username: "your-username",
         }}
       >
         {/* Your components here */}
       </MqttConnector>
     );
   }
   ```

2. Then, use the `useTopic` hook to subscribe to a topic and receive messages from the broker in your components within the `MqttConnector` component.

   ```tsx
   import { useTopic } from "react-mqtt-hooks";

   function ChatMsg() {
     const msg = useTopic("chat");
     return (
       <div>
         <h1>Messages from the broker:</h1>
         <pre>
           {JSON.stringify(msg, null, 2)}
         </pre>
       </div>
     );
   }
   ```

   `useTopic` will cache the last message data received from the broker and update the component state under the hood. This concept is inspired by the [SWR](https://swr.vercel.app/) library.

   Multiple `useTopic` hook **with same topic** will share the same message data cache. This means you can call `useTopic` accross different components and they will retrieve the same message data from cache if it exists.

## 📚 API Refference

### `MqttConnector`

The `MqttConnector` component is a provider that wraps your application and provides the raw `MqttClient` instance from [MQTT.js](https://github.com/mqttjs/MQTT.js) to the context. It also handles the connection and disconnection of the client.

All hooks provided by this library must be used within the `MqttConnector` component.

```tsx
import { MqttConnector } from "react-mqtt-hooks";

function App() {
  return (
    <MqttConnector
      url="ws://example-broker-url/mqtt"
      options={{
        clientId: "your-client-id",
      }}
    >
      {/* Your components */}
    </MqttConnector>
  );
}
```

### `useMqttClient`

The `useMqttClient` hook is used to access the raw `MqttClient` instance from [MQTT.js](https://github.com/mqttjs/MQTT.js).

```tsx
import { useEffect, useState } from "react";
import { useMqttClient } from "react-mqtt-hooks";

function ConnectionStatus() {
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

  return (
    <div>
      Connection status:
      {status}
    </div>
  );
}
```

### `useTopic`

> [!WARNING]
> This hook currently not support wildcard subscriptions yet.

The `useTopic` hook is used to subscribe to a specific topic and receive messages from the broker. It returns the last message received from the broker.

```tsx
import { useTopic } from "react-mqtt-hooks";

function SingleTopic() {
  const msg = useTopic("chat");

  return (
    <pre>
      {JSON.stringify(msg, null, 2)}
    </pre>
  );
}
```

### `useTopics`

The `useTopics` hook is used to subscribe to multiple topics and receive messages from the broker. It merge all data from every topics into a single object.

```tsx
import { useTopics } from "react-mqtt-hooks";

function MultiTopics() {
  // Must wrap the topics array with useMemo to prevent re-rendering
  const topicsArr = useMemo(() => ["chat/1", "chat/2"], []);
  const msg = useTopics(topicsArr);

  return (
    <pre>
      {JSON.stringify(msg, null, 2)}
    </pre>
  );
}
```
