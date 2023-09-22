import { Action } from "@shared/action"
import { GameEvent } from "@shared/event"

/**
 * Socket class, singleton.
 */
export class Socket {
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

    static async waitForConnectionOpen(): Promise<void> {
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
            args: action
        })
        console.log("Sending message", data)
        this.socket.send(data)
    }

    addEventListener<T extends GameEvent>(event: Function, callback: (event: T) => void) {
        this.socket.addEventListener("message", (msg) => {
            const data = JSON.parse(msg.data.toString())
            if (data.type === event.name) {
                callback(data.args)
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