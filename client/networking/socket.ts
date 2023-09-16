import { Action } from "@shared/action"

/**
 * Socket class, singleton.
 */
export class Socket {
    private static _instance: Socket
    private socket: WebSocket
    private constructor() {
        this.socket = new WebSocket("ws://localhost:8080")
        this.socket.onopen = this.onOpen.bind(this)
        this.socket.onmessage = this.onMessage.bind(this)
        this.socket.onclose = this.onClose.bind(this)
        this.socket.onerror = this.onError.bind(this)
    }

    private onOpen() {
        console.log("Connection opened")
    }

    private onMessage(msg: WebSocketMessageEvent) {
        console.log("Received message", msg)
    }

    private onClose() {
        console.log("Connection closed")
    }

    private onError(err: Event) {
        console.error(err)
    }

    public static get instance(): Socket {
        if (!Socket._instance) {
            Socket._instance = new Socket()
        }
        return Socket._instance
    }

    public static async waitForConnectionOpen(): Promise<void> {
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

    public perform(action: Action) {
        this.socket.send(JSON.stringify({
            type: action.constructor.name,
            args: action
        }))
    }
}