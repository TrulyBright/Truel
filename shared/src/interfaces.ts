import { Drift } from "@/enums"
import { Event, EventConstructor } from "@/event"

export interface Payload {
    type: string
    args: any
}

/**
 * Mark `@Expose()` on properties that need to be serialized.
 */
export interface UserCommonInterface {
    name: string
}

/**
 * Mark `@Expose()` on properties that need to be serialized.
 */
export interface RoomCommonInterface {
    readonly id: number
    name: string
    host: UserCommonInterface
    members: UserCommonInterface[]
    maxMembers: number

    get isPrivate(): boolean
}

/**
 * Mark `@Expose()` on properties that need to be serialized.
 */
export interface PlayerCommonInterface {
    user: UserCommonInterface
    alive: boolean
    cash: number
    probability: number
    drift: Drift

    get name(): string
}

type EventListener<T extends Event> = (event: T) => void

export class EventListening {
    private readonly defaultListeners = new Set<EventListener<Event>>()
    private readonly listeners = new Map<EventConstructor<Event>, Set<EventListener<Event>>>()

    setDefaultListener(listener: EventListener<Event>) {
        this.defaultListeners.add(listener)
    }

    on<T extends Event>(eventType: EventConstructor<T>, listener: EventListener<T>) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set())
        }
        this.listeners.get(eventType)!.add(listener as EventListener<Event>)
        return this
    }

    off<T extends Event>(eventType: EventConstructor<T>, listener: EventListener<T>) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType)!.delete(listener as EventListener<Event>)
        }
        return this
    }

    once<T extends Event>(eventType: EventConstructor<T>, listener: EventListener<T>) {
        const onceListener = (event: T) => {
            listener(event)
            this.off(event.constructor as EventConstructor<Event>, onceListener as EventListener<Event>)
        }
        this.on(eventType, onceListener as EventListener<T>)
        return this
    }

    recv<T extends Event>(event: T) {
        this.listeners.get(event.constructor as EventConstructor<Event>)?.forEach(l => l(event))
        this.defaultListeners.forEach(l => l(event))
    }

    removeListeners<T extends Event>(event: EventConstructor<T>) {
        this.listeners.delete(event)
        return this
    }
}