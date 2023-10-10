import "reflect-metadata"
import { instanceToPlain, plainToInstance } from "class-transformer"
import { WebSocketServer } from "ws"
import Hub from "@/hub"
import User from "@/user"
import { constructors } from "@shared/action"
import { Event } from "@shared/event"

export default class WebSocketEndpoint {
    readonly wsServer: WebSocketServer
    readonly hub: Hub = new Hub()
    userIdCounter = 0
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
            const user = new User("user" + this.userIdCounter++)
            user.setDefaultListener((event: Event) => {
                const data = JSON.stringify({
                    type: event.constructor.name,
                    args: instanceToPlain(event)
                })
                ws.send(data)
            })
            this.hub.addUser(user)
            ws.onmessage = (message) => {
                const { type, args } = JSON.parse(message.data.toString()) as { type: string, args: any }
                const constructor = constructors[type]
                if (!constructor) {
                    console.error(message)
                    return
                }
                const action = plainToInstance(constructor, args)
                this.hub.handle(user, action)
            }
            ws.onclose = () => {
                this.hub.removeUser(user)
            }
        })
    }
    close() {
        this.wsServer.close()
    }
    get URI() {
        return `ws://${this.host}:${this.port}`
    }
}