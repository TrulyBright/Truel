# Truel
*Truel* is an online multiplayer game where players bet and shoot at each other with varying probability of kill. The last man standing wins all the stakes.
## Key point of the code
*Truel* has two key classes: `Action` and `Event`. `Action` is what `User` can *do* and `Event` is what is sent to `User`. Both `/client` and `/server` share the same code implementing `Action` and `Event` in `/shared`, in order for that code to work as an *interface*.
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
Once the JSON arrives, the server parses it and finds the constructor for that `Action`. In this case, it's `JoinRoom.constructor`. With the constructor function found, the server makes an `Action` object with arguments given in the `"args"` field in the JSON above, just like the following:
```typescript
const data = JSON.parse(message.toString())
const constructor = actionConstructors[data.type]
const action = new constructor()
Object.assign(action, data.args)
```
where `actionConstructors` is an `Object` that you can find a constructor by its name.

The following code snippet is for you to understand `actionConstructors`.
```typescript
class CreateRoom {
    ...
}
actionConstructors["CreateRoom"] === CreateRoom.constructor // true
```

After the `Action` is made, the server sends it to `Hub`, which processes it.

### `Event`
`Event` is what *happens*. Every time something happens, the `Hub` makes a `Event` and sends it to some `User`s, with the following structure:
```JSON
{
    "type": "UserJoinedRoom",
    "args": {
        "name": "Newcomer"
    }
}
```
When the JSON arrives, the client parses it and processes it according to its `type`.