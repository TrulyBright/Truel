import { Event } from "@shared/event"
import { Action, ActionConstructor } from "@shared/action"
import User from "@/user"

export interface Broadcasting {
    broadcast(event: Event): void
}

type ActionHandler<T extends Action> = (user: User, action: T) => void

export class ActionHandling<K extends Action> {
    private readonly handlers = new Map<ActionConstructor<K>, Set<ActionHandler<K>>>()

    on<T extends K>(actionType: ActionConstructor<T>, handler: ActionHandler<T>) {
        if (!this.handlers.has(actionType)) {
            this.handlers.set(actionType, new Set())
        }
        this.handlers.get(actionType)!.add(handler as ActionHandler<K>)
        return this
    }

    off<T extends K>(actionType: ActionConstructor<T>, handler: ActionHandler<T>) {
        this.handlers.get(actionType)?.delete(handler as ActionHandler<K>)
        return this
    }

    once<T extends K>(actionType: ActionConstructor<T>, handler: ActionHandler<T>) {
        const onceHandler = (user: User, action: T) => {
            handler(user, action)
            this.off(action.constructor as ActionConstructor<T>, onceHandler as ActionHandler<T>)
        }
        this.on(actionType, onceHandler as ActionHandler<T>)
        return this
    }

    handle<T extends K>(user: User, action: T) {
        this.handlers.get(action.constructor as ActionConstructor<K>)?.forEach(h => h(user, action))
        return this
    }

    removeAllHandlers<T extends K>(actionType: ActionConstructor<T>) {
        this.handlers.delete(actionType)
        return this
    }
}