<h1 align="center">
  <img src="./public/logo.svg" alt="React-Mqtt-Hooks logo"/>
  <p>React-Mqtt-Hooks</p>
</h1>

## Introduction

React-Mqtt-Hooks is a library that simplifies the integration of [MQTT](https://mqtt.org/) (Message Queuing Telemetry Transport) functionality into React applications. It provides a set of custom hooks that allow developers to easily connect to an MQTT broker based on the popular [MQTT.js](https://github.com/mqttjs/MQTT.js) library.

With these hooks, you can publish messages to specific topics and subscribe to receive messages from the broker. The library seamlessly synchronizes the received MQTT messages with the state of your React functional components, enabling real-time updates and efficient data handling within your application.

## ✨ Features

- **Global Cache**: The message received from the MQTT broker is stored in a global cache, which can be accessed from any component in the application.
- **Real-time Updates**: The library automatically updates the state of your components when new messages are received from the broker.

## 📦 Installation

```bash
npm i react-mqtt-hooks
# or
pnpm add react-mqtt-hooks
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
         {/* Your components */}
       </MqttConnector>
     );
   }
   ```

2. Then, use the `useTopic` hook to subscribe to a topic and receive messages from the broker in your components within the `MqttConnector` component.

   ```tsx
   import { useTopic } from "react-mqtt-hooks";

   function ChatMsg() {
     // This hook return a Buffer object from Broker,
     // you can use toString() to convert it to a string
     // or whatever you want.
     const msg = useTopic("chat");

     return (
       <div>
         <h1>Messages from the broker:</h1>
         <p>{msg?.toString()}</p>
       </div>
     );
   }
   ```

   `useTopic` will cache the last message data received from the broker and update the component state under the hood. This concept is inspired by the [SWR](https://swr.vercel.app/) library.

   Multiple `useTopic` hook **with same topic** will share the same message data cache. This means you can call `useTopic` accross different components and they all will behave the same.

## 📚 API Refference

### `MqttConnector`

The `MqttConnector` component is a provider that wraps your application and provides the [MQTT.js](https://github.com/mqttjs/MQTT.js) client instance and connection status to the context. It also handles the connection and disconnection of the client.

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

### `useMqttConnector`

The `useMqttConnector` hook is used to access `MqttConnector` component context. It provides 2 values:

- `client`: The MQTT.js client instance, more details about the client instance can be found in the [MQTT.js documentation](https://github.com/mqttjs/MQTT.js?tab=readme-ov-file#mqttclientpublishtopic-message-options-callback).
- `status`: The connection status of the client.

```tsx
import { useMqttConnector } from "react-mqtt-hooks";

function MyComponent() {
  const { client, status } = useMqttConnector();

  return (
    <div>
      <p>Client ID: {client?.options.clientId}</p>
      <p>Status: {status}</p>
    </div>
  );
}
```

### `useTopic`

_This hook currently not support multiple topics and wildcard subscriptions yet._

The `useTopic` hook is used to subscribe to a specific topic and receive messages from the broker. It returns the last message **buffer** received from the broker. You can convert it to whatever you want.

```tsx
import { useTopic } from "react-mqtt-hooks";

function MyComponent() {
  const msg = useTopic("my-topic");

  return <p>{msg?.toString()}</p>;
}
```
