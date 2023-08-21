import { WebSocketServer } from "ws"
import { Hub } from "@/hub"
import { User } from "@/user"

const wss = new WebSocketServer({ port: 8080 })
const hub = new Hub()

wss.on("connection", (ws) => {
    const user = new User("test")
    hub.addUser(user)
    ws.on("message", (message) => {
        console.log(`received: ${message}`)
    })
    ws.on("close", () => {
        hub.removeUser(user)
    })
})
