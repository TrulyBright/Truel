import { Action } from "@shared/action";
import { GameEvent } from "@shared/event";
import { User } from "@/user";

export interface Broadcasting {
    broadcast(event: GameEvent): void
}

export interface ActionHandling {
    superActionHandler: ActionHandling | null
    handleAction(user: User, action: Action): void
    setSuperActionHandler(handler: ActionHandling): void
    unsetSuperActionHandler(): void
}