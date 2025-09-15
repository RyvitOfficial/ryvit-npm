# Ryvit

Ryvit is a TypeScript package for managing **event-based routes** in Express and creating **automatic Serveo tunnels**.  
It allows you to receive events via HTTP, verify signatures, and define custom handlers for each event type.

---

## Installation

```bash
npm install ryvit
# or
yarn add ryvit
```

---

## Features

* Create event routes in Express with automatic **signature verification**
* Handle multiple custom events with type safety
* Easy integration with Serveo for online testing via SSH tunnels

---

## Usage

### 1. Setting up Event Routes

```ts
import express from "express";
import { eventSetup, EventRouteOptions } from "ryvit";

const app = express();

// Define your event types
interface MyEvents {
    userCreated: { id: string; name: string };
    userDeleted: { id: string };
}

// Define handlers for events
const options: EventRouteOptions<MyEvents> = {
    publicKey: "YOUR_PUBLIC_KEY",
    handlers: {
        userCreated: (data) => {
            console.log("User created:", data);
        },
        userDeleted: (data) => {
            console.log("User deleted:", data);
        }
    }
};

// Setup event route (default: /events)
eventSetup(app, options);

app.listen(3000, () => console.log("Server running on port 3000"));
```

#### Explanation

* `eventSetup(app, options)`
  Creates an Express route (default `/events`) to handle PUT and POST requests with **signature validation**.

* `EventRouteOptions<T>` parameters:

  * `route?: string` → Optional custom route path (default is `/events`)
  * `publicKey: string` → The public key used for verifying signatures
  * `handlers: { [K in keyof T]: (data: T[K]) => void }` → Functions executed for each event

* **PUT request** → Used to **verify a message signature**

* **POST request** → Used to **send a real event** and execute the corresponding handler

---

### 2. Running Serveo Tunnel

```ts
import { runServeo } from "ryvit";

// Create a Serveo tunnel to port 5000
runServeo(5000);
```

#### Explanation

* `runServeo(port: number)`
  Opens an SSH tunnel to [Serveo.net](https://serveo.net) so your local server can be accessed online.
* Uses `ssh.exe` on Windows and `ssh` on Linux/macOS.
* Tunnel logs are printed to `stdout` and `stderr`.

---

## API Reference

### `eventSetup<T>(app: Application, options: EventRouteOptions<T>)`

Sets up an event route with signature validation and handlers.

**Parameters:**

| Parameter | Type                   | Description                                              |
| --------- | ---------------------- | -------------------------------------------------------- |
| `app`     | `Application`          | Your Express app instance                                |
| `options` | `EventRouteOptions<T>` | Options object containing route, publicKey, and handlers |

**Example:**

```ts
eventSetup(app, {
    publicKey: "YOUR_PUBLIC_KEY",
    handlers: {
        myEvent: (data) => console.log(data)
    }
});
```

---

### `EventRouteOptions<T>`

Defines options for `eventSetup`.

**Properties:**

| Property    | Type                                       | Required | Description                                     |
| ----------- | ------------------------------------------ | -------- | ----------------------------------------------- |
| `route`     | `string`                                   | No       | Custom route path (default `/events`)           |
| `publicKey` | `string`                                   | Yes      | Public key to verify incoming event signatures  |
| `handlers`  | `{ [K in keyof T]: (data: T[K]) => void }` | Yes      | Object mapping event names to handler functions |

---

### `runServeo(port: number)`

Opens a Serveo SSH tunnel to expose your local server.

**Parameters:**

| Parameter | Type     | Required | Description                  |
| --------- | -------- | -------- | ---------------------------- |
| `port`    | `number` | Yes      | Local port number to forward |

**Example:**

```ts
runServeo(3000);
```

---

## Example: Full Integration

```ts
import express from "express";
import { eventSetup, runServeo } from "ryvit";

const app = express();

interface Events {
    testEvent: { message: string };
}

eventSetup(app, {
    publicKey: "YOUR_PUBLIC_KEY",
    handlers: {
        testEvent: (data) => console.log("Received testEvent:", data)
    }
});

runServeo(3000);

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

## HTTP Request Format

**POST /events** → Send event and trigger handler

```json
{
    "name": "eventName",
    "payload": "{...JSON_PAYLOAD...}",
    "signature": "BASE64_SIGNATURE"
}
```

