import "reflect-metadata"
import { instanceToPlain, plainToClass } from "class-transformer"
import { WebSocketServer } from "ws"
import Hub from "@/hub"
import User from "@/user"
import { CreateRoom, actionConstructors } from "@shared/action"
import { Event } from "@shared/event"

export default class WebSocketEndpoint {
    wsServer: WebSocketServer
    hub: Hub = new Hub()
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
            user.on("Event", (event: Event) => {
                const data = JSON.stringify({
                    type: event.constructor.name,
                    args: instanceToPlain(event)
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
    addDummyRooms() {
        this.hub.users.filter(user => user.name.startsWith("dummy")).forEach((user, i) => {
            this.hub.emit(CreateRoom.name, user, new CreateRoom("dummyRoom", 8, i % 2 === 0 ? "password": null))
        })
    }
    get URI() {
        return `ws://${this.host}:${this.port}`
    }
}