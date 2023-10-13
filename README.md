# Truel
*Truel* is an online multiplayer game where players bet and shoot at each other with varying probability of kill. The last man standing wins all the stakes.
## How to run
### Running the client SPA
`cd client && pnpm install && pnpm run watch`
### Running the server
`cd server && pnpm install && pnpm run watch`
## Structure of the code
*Truel* has two key concepts: `Action` and `Event`. `Action` is what `User` sends to the server and `Event` is what is sent to `User`. Both `/client` and `/server` share the same code implementing `Action` and `Event` in `/shared`, in order for that code to work as an interface.
### `Action`
`User` can only *perform* `Action`. To perform an `Action`, the client sends a JSON with the following structure:
```JSON
{
    "type": "JoinRoom",
    "args": {
        "roomId": 1,
        "password": null
    }
}
```
Below is the code that performs action:
```typescript
import { Action } from "@shared/action"
import { instanceToPlain } from "class-transformer"
class Client {
    perform<A extends Action>(action: A) {
        const data = {
            type: action.constructor.name,
            args: instanceToPlain(action)
        }
        const raw = JSON.stringify(data)
        this.ws!.send(raw)
    }
}
```
where `this.ws` is a `WebSocket` instance provided by the browser.

Once the JSON arrives, the server parses it and finds the constructor for that `Action`. In this case, it's `JoinRoom.constructor`. With the constructor function found, the server makes an `Action` object with the arguments given in the `"args"` field in the JSON above, just like the following:
```typescript
import { plainToClass } from "class-transformer"
import { constructors } from "@shared/action"
ws.on("message", (message) => {
    const { type, args } = JSON.parse(message.toString()) as { type: string, args: any }
    const constructor = constructors[type]
    const action = plainToInstance(constructor, args)
})
```
where `constructors` is a `Record` that you can find a constructor by its name.

The following code snippet is for you to understand `constructors`.
```typescript
class CreateRoom implements Action {
    ...
}
constructors["CreateRoom"] === CreateRoom.constructor // true
```

After the `Action` is made, the server sends it to `Hub`, which processes it.

### `Event`
`Event` is what *happens*. Every time something some `User`s must know happens, the `Hub` makes an `Event` and sends it to them, with the following structure:
```JSON
{
    "type": "UserJoinedRoom",
    "args": {
        "name": "Newcomer"
    }
}
```
When the JSON arrives, the client parses it and processes it according to its `type`, like below:
```typescript
import { constructors } from "@shared/event"
import { plainToInstance } from "class-transformer"
this.ws.onmessage = (e) => {
    const { type, args } = JSON.parse(e.data) as { type: string, args: any }
    const constructor = constructors[type]
    const event = plainToInstance(constructor, args)
    this.recv(event)
}
```