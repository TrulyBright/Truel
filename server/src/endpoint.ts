import "reflect-metadata"
import { plainToClass } from "class-transformer"
import { WebSocketServer } from "ws"
import Hub from "@/hub"
import User from "@/user"
import { actionConstructors } from "@shared/action"
import { GameEvent } from "@shared/event"

export default class WebSocketEndpoint {
    wsServer: WebSocketServer
    hub: Hub = new Hub()
    constructor(
        public readonly host: string,
        public readonly port: number
    ) {
        this.wsServer = new WebSocketServer({
            host: this.host,
            port: this.port,
        })
    }
    start() {
        this.wsServer.on("connection", (ws) => {
            const user = new User("test")
            user.on("GameEvent", (event: GameEvent) => {
                const data = JSON.stringify({
                    type: event.constructor.name,
                    args: event
                })
                ws.send(data)
            })
            this.hub.addUser(user)
            ws.on("message", (message) => {
                const data = JSON.parse(message.toString())
                const constructor = actionConstructors[data.type]
                if (!constructor) {
                    console.error("Unknown action: " + JSON.stringify(data))
                    return
                }
                const action = plainToClass(constructor, data.args)
                console.log(`User ${user.name} sent action ${action.constructor.name}`)
                this.hub.emit(action.constructor.name, user, action)
            })
            ws.on("close", () => {
                this.hub.removeUser(user)
            })
        })
    }
    close() {
        this.wsServer.close()
    }
    addDummyUsers(count: number) {
        for (let i = 0; i < count; i++) {
            const user = new User("dummy" + i)
            this.hub.addUser(user)
        }
    }
    get URI() {
        return `ws://${this.host}:${this.port}`
    }
}