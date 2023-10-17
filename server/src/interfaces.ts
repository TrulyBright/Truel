import { Event } from "@shared/event"
import { Action, ActionConstructor } from "@shared/action"

export interface Broadcasting {
    broadcast(event: Event): void
}

type ActionHandler<Actor, A extends Action> = (actor: Actor, action: A) => void

export class ActionHandling<Actor, A extends Action> {
    private readonly handlers = new Map<ActionConstructor<A>, Set<ActionHandler<Actor, A>>>()

    on<T extends A>(actionType: ActionConstructor<T>, handler: ActionHandler<Actor, T>) {
        if (!this.handlers.has(actionType)) {
            this.handlers.set(actionType, new Set())
        }
        this.handlers.get(actionType)!.add(handler as ActionHandler<Actor, A>)
        return this
    }

    off<T extends A>(actionType: ActionConstructor<T>, handler: ActionHandler<Actor, T>) {
        this.handlers.get(actionType)?.delete(handler as ActionHandler<Actor, A>)
        return this
    }

    once<T extends A>(actionType: ActionConstructor<T>, handler: ActionHandler<Actor, T>) {
        const onceHandler = (actor: Actor, action: T) => {
            handler(actor, action)
            this.off(action.constructor as ActionConstructor<A>, onceHandler as ActionHandler<Actor, A>)
        }
        this.on(actionType, onceHandler as ActionHandler<Actor, T>)
        return this
    }

    handle(actor: Actor, action: A) {
        this.handlers.get(action.constructor as ActionConstructor<A>)?.forEach(handler => handler(actor, action))
    }

    removeAllHandlers() {
        this.handlers.clear()
        return this
    }

    removeAllHandlersOf<T extends A>(actionType: ActionConstructor<T>) {
        this.handlers.delete(actionType)
        return this
    }
}