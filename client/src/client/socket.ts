import { Action } from "@shared/action"
import { Event, EventConstructor } from "@shared/event"
import { plainToClass, instanceToPlain } from "class-transformer"

/**
 * Socket class, singleton.
 */
export default class Socket {
    private static _instance: Socket
    private socket: WebSocket
    private constructor() {
        this.socket = new WebSocket("ws://localhost:8080")
        this.socket.addEventListener("message", (event => {
            console.log(JSON.parse(event.data))
        }))
    }

    static get instance(): Socket {
        if (!Socket._instance) {
            Socket._instance = new Socket()
        }
        return Socket._instance
    }

    waitForConnectionOpen(): Promise<void> {
        return new Promise((resolve, reject) => {
            const socket = Socket.instance.socket
            if (socket.readyState === WebSocket.OPEN) {
                resolve()
            } else {
                socket.addEventListener("open", () => resolve())
                socket.addEventListener("error", () => reject())
            }
        })
    }

    perform(action: Action) {
        const data = JSON.stringify({
            type: action.constructor.name,
            args: instanceToPlain(action)
        })
        console.log("Sending message", data)
        this.socket.send(data)
    }

    addEventListener(event: EventConstructor, callback: (event: Event) => void) {
        this.socket.addEventListener("message", (msg) => {
            const data = JSON.parse(msg.data.toString())
            if (data.type === event.name) {
                callback(plainToClass(event, data.args))
            }
        })
    }

    onOpen(callback: () => void) {
        this.socket.addEventListener("open", callback)
    }

    onClose(callback: () => void) {
        this.socket.addEventListener("close", callback)
    }

    onError(callback: () => void) {
        this.socket.addEventListener("error", callback)
    }
}