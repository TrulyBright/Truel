# Truel
*Truel* is an online multiplayer game where players bet and shoot at each other with varying probability of kill. The last man standing wins all the stakes.
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
Once the JSON arrives, the server parses it and finds the constructor for that `Action`. In this case, it's `JoinRoom.constructor`. With the constructor function found, the server makes an `Action` object with the arguments given in the `"args"` field in the JSON above, just like the following:
```typescript
import { plainToClass } from "class-transformer"
import { constructors } from "@shared/action"
ws.on("message", (message) => {
    const data = JSON.parse(message.toString())
    const constructor = constructors[data.type]
    const action = plainToClass(constructor, data.args)
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
When the JSON arrives, the client parses it and processes it according to its `type`.