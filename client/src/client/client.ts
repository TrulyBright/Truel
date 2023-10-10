import { Action } from "@shared/action";
import { constructors } from "@shared/event";
import { EventListening } from "@shared/interfaces";
import { instanceToPlain, plainToInstance } from "class-transformer";

class Client extends EventListening {
    private ws?: WebSocket

    constructor(
        public readonly host: string,
        public readonly port: number
    ) {
        super()
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

export default new Client("localhost", 8080)