import { Action, Shoot } from "@shared/action"
import { GameEvent, YouDied } from "@shared/event"
import { Room } from "@/room"

type EventHandler = (event: GameEvent) => void

export class User {
    eventHandler: EventHandler[] = []
    room: Room | null = null
    muting: User[] = []
    
    /// In-game properties
    probability: number
    cash: number
    alive: boolean
    
    constructor(
        public readonly name: string,
    ) {}

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

    resetForNewGame() {
        this.cash = 200
    }

    resetForNewRound() {
        if (this.cash <= 0) { return }
        this.probability = Math.random()
        this.alive = true
    }

    die() {
        this.alive = false
        this.recv(new YouDied())
    }
}