/**
 * Socket class, singleton.
 */
export class Socket {
    private static _instance: Socket
    private socket: WebSocket
    private constructor() {
        this.socket = new WebSocket("ws://localhost:3000")
        this.socket.onopen = this.onOpen.bind(this)
        this.socket.onmessage = this.onMessage.bind(this)
        this.socket.onclose = this.onClose.bind(this)
        this.socket.onerror = this.onError.bind(this)
    }

    private onOpen() {
        console.log("Connection opened")
    }

    private onMessage(msg: MessageEvent) {
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
}