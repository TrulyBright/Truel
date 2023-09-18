import { WebSocketServer } from "ws"
import { Hub } from "@/hub"
import { User } from "@/user"
import { actionConstructors } from "@shared/action"

const wss = new WebSocketServer({ port: 8080 })
const hub = new Hub()

wss.on("connection", (ws) => {
    const user = new User("test")
    user.on("GameEvent", event => {
        const data = JSON.stringify({
            type: event.constructor.name,
            args: event
        })
        console.log(`${user.name} receives ${data}`)
        ws.send(data)
    })
    hub.addUser(user)
    ws.on("message", (message) => {
        const data = JSON.parse(message.toString())
        const constructor = actionConstructors[data.type]
        if (!constructor) console.error("Unknown action: " + data)
        const action = new constructor()
        Object.assign(action, data.args)
        hub.emit(action.constructor.name, user, action)
    })
    ws.on("close", () => {
        hub.removeUser(user)
    })
})
