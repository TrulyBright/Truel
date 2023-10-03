import { Action } from "@shared/action"
import { Event, EventConstructor, constructors } from "@shared/event"
import { instanceToPlain, plainToInstance } from "class-transformer"

class Client {
    private ws: WebSocket
    private readonly listeners: Record<string, ((event: Event) => void)[]> = {}

    constructor(
        public readonly host: string,
        public readonly port: number,
    ) {
        this.connect()
    }

    connect() {
        if (this.ws) throw new Error("Already connected")
        this.ws = new WebSocket(`ws://${this.host}:${this.port}`)
        this.ws.onmessage = (message) => {
            const { type, args } = JSON.parse(message.data.toString()) as { type: string, args: any }
            const constructor = constructors[type]
            const event = plainToInstance(constructor, args)
            this.emit(constructor, event)
        }
    }
    
    disconnect() {
        this.ws.close()
    }

    get connected() {
        return this.ws.readyState === WebSocket.OPEN
    }

    waitUntilConnected() {
        return new Promise<void>((resolve, reject) => {
            if (this.connected) resolve()
            else {
                this.ws.onopen = () => resolve()
                this.ws.onerror = (e) => reject(e)
            }
        })
    }

    perform<T extends Action>(action: T) {
        const payload = {
            type: action.constructor.name,
            args: instanceToPlain(action)
        }
        const serialized = JSON.stringify(payload)
        console.log(serialized)
        this.ws.send(serialized)
    }

    on<T extends Event>(type: EventConstructor<T>, listener: (event: T) => void) {
        if (!this.listeners[type.name]) this.listeners[type.name] = []
        this.listeners[type.name].push(listener)
        return this
    }

    off<T extends Event>(type: EventConstructor<T>, listener: (event: T) => void) {
        if (!this.listeners[type.name]) return
        this.listeners[type.name] = this.listeners[type.name].filter(l => l !== listener)
        return this
    }

    once<T extends Event>(type: EventConstructor<T>, listener: (event: T) => void) {
        const once = (event: T) => {
            this.off(type, once)
            listener(event)
        }
        this.on(type, once)
        return this
    }

    private emit<T extends Event>(type: EventConstructor<T>, event: T) {
        if (!this.listeners[type.name]) return
        this.listeners[type.name].forEach(l => l(event))
    }
}

export default new Client("localhost", 8080)