import { Action, ACTION_CONSTRUCTORS } from "@shared/action";
import { EVENT_CONSTRUCTORS } from "@shared/event";
import { EventListening, Payload } from "@shared/interfaces";
import { instanceToPlain, plainToInstance } from "class-transformer";

export default class Client extends EventListening {
    private static _instance?: Client
    private ws?: WebSocket

    private constructor(
        public readonly host: string,
        public readonly port: number
    ) {
        super()
    }

    static get instance() {
        if (!Client._instance) {
            Client._instance = new Client("localhost", 8080)
        }
        return Client._instance
    }

    get URI() { return `ws://${this.host}:${this.port}` }

    connect() {
        this.ws = new WebSocket(this.URI)
        this.ws.onmessage = (e) => {
            const { type, args } = JSON.parse(e.data) as Payload
            const constructor = EVENT_CONSTRUCTORS[type]
            const event = plainToInstance(constructor, args)
            console.log(type, args)
            this.recv(event)
        }
        return this
    }

    disconnect() {
        this.ws!.close()
    }

    assureConnected() {
        return new Promise<void>((resolve, reject) => {
            if (!this.ws) reject()
            if (this.ws!.readyState === WebSocket.OPEN) resolve()
            this.ws!.onopen = () => resolve()
        })
    }

    perform<A extends Action>(action: A) {
        const data: Payload = {
            type: ACTION_CONSTRUCTORS.findIndex(constructor => action instanceof constructor),
            args: instanceToPlain(action, { enableCircularCheck: true })
        }
        if (data.type === -1) throw new Error("Action not found")
        const raw = JSON.stringify(data)
        console.log(data.type, data.args)
        this.ws!.send(raw)
    }

    onDisconnect(callback: () => void) {
        this.ws!.onclose = callback
        return this
    }
}