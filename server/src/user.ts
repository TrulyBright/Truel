import { EventEmitter } from "node:events"
import { GameEvent } from "@shared/event"
import { UserCommonInterface } from "@shared/interfaces"
import { Queue } from "@shared/utils"
import { Card, Drift } from "@shared/enums"
import { Room } from "@/room"

export class User extends EventEmitter implements UserCommonInterface {
    room: Room | null = null
    readonly last50Events = new Queue<GameEvent>()
    private readonly eventRecorder = (e: GameEvent) => {
        this.last50Events.enqueue(e)
        if (this.last50Events.length > 50) this.last50Events.dequeue()
    }
    // in-game properties
    alive: boolean
    cash: number
    probability = 0.5
    card: Card | null
    drift: Drift
    buff = {
        [Card.Robbery]: false,
        [Card.BulletProof]: false,
        [Card.PatronB]: false,
        [Card.Meditation]: false,
        [Card.Curse]: false,
        [Card.Insurance]: false,
        [Card.LastDitch]: false,
    }
    has_run = false

    constructor(public readonly name: string) {
        super()
        this.on("GameEvent", this.eventRecorder)
    }

    recv(event: GameEvent) {
        this.emit("GameEvent", event)
        this.emit(event.constructor.name, event)
    }

    joinRoom(room: Room) {
        this.room = room
    }

    leaveRoom() {
        this.room = null
    }

    resetForNewGame() {
        this.alive = true
        this.card = null
        this.cash = 200
    }

    resetForNewRound() {
        this.alive = this.cash > 0
        this.card = null
        this.drift = Drift.Hold
        this.probability = Math.random()
        // reset buff
        this.buff = {
            [Card.Robbery]: false,
            [Card.BulletProof]: false,
            [Card.PatronB]: false,
            [Card.Meditation]: false,
            [Card.Curse]: false,
            [Card.Insurance]: false,
            [Card.LastDitch]: false,
        }
    }
}