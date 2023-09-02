import { WebSocketServer } from "ws"
import { Hub } from "@/hub"
import { User } from "@/user"

const wss = new WebSocketServer({ port: 8080 })
const hub = new Hub()

wss.on("connection", (ws) => {
    const user = new User("test")
    user.onEvent(event => {
        const data = JSON.stringify({
            type: event.constructor.name,
            args: event
        })
        console.log(`${user.name} receives ${data}`)
        ws.send(data)
    })
    hub.addUser(user)
    ws.on("message", (message) => {
        console.log(`received: ${message}`)
    })
    ws.on("close", () => {
        hub.removeUser(user)
    })
})
