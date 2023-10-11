import { Action } from "@shared/action";
import { constructors } from "@shared/event";
import { EventListening } from "@shared/interfaces";
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
            const { type, args } = JSON.parse(e.data) as { type: string, args: any }
            const constructor = constructors[type]
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
        const data = {
            type: action.constructor.name,
            args: instanceToPlain(action)
        }
        const raw = JSON.stringify(data)
        console.log(data.type, data.args)
        this.ws!.send(raw)
    }
}