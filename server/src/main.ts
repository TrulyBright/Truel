import { WebSocketServer } from "ws"
import { Hub } from "@/hub"
import { User } from "@/user"
import { actionConstructors } from "@shared/action"

const wss = new WebSocketServer({ port: 8080 })
const hub = new Hub()

wss.on("connection", (ws) => {
    const user = new User("test")
    user.addEventListener(event => {
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
        if (!constructor) throw Error("Unknown action: " + data.type)
        const action = new constructor(...data.args)
        user.perform(action)
    })
    ws.on("close", () => {
        hub.removeUser(user)
    })
})
