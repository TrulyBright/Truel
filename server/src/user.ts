import { Action, DrawCard, Shoot } from "@shared/action"
import { GameError, GameEvent, YouDied } from "@shared/event"
import { Queue, withTimeout } from "@shared/utils"
import { Card, Drift } from "@shared/enums"
import { Room } from "@/room"
import { ActionHandling } from "./interfaces"

export type EventHandler = (event: GameEvent) => void
export type ActionCallback = (action: Action) => void

export class User implements ActionHandling {
    superActionHandler: ActionHandling | null = null
    actionCallbacks: ActionCallback[] = []
    eventHandler: EventHandler[] = []
    room: Room | null = null
    readonly last50Events = new Queue<GameEvent>()
    private readonly eventRecorder: EventHandler = (e: GameEvent) => {
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
        this.addEventListener(this.eventRecorder)
    }

    perform(action: Action) {
        console.log(`${this.name} performs ${action.constructor.name}`)
        this.handleAction(this, action)
    }

    // `User` is a special case of `ActionHandling`.
    // So, for `User`, call `perform()` instead of this function `handleAction()`.
    handleAction(user: User, action: Action) {
        try {
            this.superActionHandler!.handleAction(user, action)
            this.afterAction(action)
        } catch (e) {
            console.error(e)
            this.recv(new GameError(9999))
        }
    }

    setSuperActionHandler(handler: ActionHandling) {
        this.superActionHandler = handler
    }

    unsetSuperActionHandler() {
        this.superActionHandler = null
    }

    afterAction(action: Action) {
        this.actionCallbacks.forEach(handler => handler(action))
    }

    addActionCallback(handler: ActionCallback) {
        this.actionCallbacks.push(handler)
    }

    removeActionCallback(handler: ActionCallback) {
        this.actionCallbacks = this.actionCallbacks.filter(h => h !== handler)
    }

    recv(event: GameEvent) {
        this.eventHandler.forEach(handler => handler(event))
    }

    addEventListener(handler: EventHandler) {
        this.eventHandler.push(handler)
    }

    removeEventListener(handler: EventHandler) {
        this.eventHandler = this.eventHandler.filter(h => h !== handler)
    }

    joinRoom(room: Room) {
        this.room = room
        this.setSuperActionHandler(room)
    }

    leaveRoom() {
        this.room = null
        this.unsetSuperActionHandler()
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

    /**
     * Block until any action of `types` is received.
     * @param types Constructors of Action
     * @returns Promise of Action
     */
    waitForAction(types: Function[]): Promise<Action> {
        return new Promise(resolve => {
            const handler = (action: Action) => {
                if (types.includes(action.constructor)) {
                    this.removeActionCallback(handler)
                    resolve(action)
                }
            }
            this.addActionCallback(handler)
        })
    }
}