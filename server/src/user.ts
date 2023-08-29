import { Action, Shoot } from "@shared/action"
import { GameEvent, YouDied } from "@shared/event"
import { Room } from "@/room"

type EventHandler = (event: GameEvent) => void

export class User {
    eventHandler: EventHandler[] = []
    room: Room | null = null
    muting: User[] = []
    constructor(
        public readonly name: string,
    ) { }

    onEvent(handler: EventHandler) {
        this.eventHandler.push(handler)
    }

    offEvent(handler: EventHandler) {
        this.eventHandler = this.eventHandler.filter(h => h !== handler)
    }

    recv(event: GameEvent) {
        this.eventHandler.forEach(handler => handler(event))
    }

    addMuted(user: User) {
        this.muting.push(user)
    }

    removeMuted(user: User) {
        this.muting = this.muting.filter(u => u !== user)
    }
}