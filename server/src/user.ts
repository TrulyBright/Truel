import { Action, Shoot } from "@shared/action"
import { GameEvent, YouDied } from "@shared/event"
import { Queue } from "@shared/utils"
import { Room } from "@/room"

export type EventHandler = (event: GameEvent) => void

export class User {
    eventHandler: EventHandler[] = []
    room: Room | null = null
    muting: User[] = []
    readonly last50Events = new Queue<GameEvent>()
    private readonly eventRecorder: EventHandler = (e: GameEvent) => {
        this.last50Events.enqueue(e)
        if (this.last50Events.length > 50) this.last50Events.dequeue()
    }

    constructor(public readonly name: string) {
        this.onEvent(this.eventRecorder)
    }

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

    joinRoom(room: Room) {
        this.room = room
    }

    leaveRoom() {
        this.room = null
    }
}