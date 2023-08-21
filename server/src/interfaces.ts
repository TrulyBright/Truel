import { Action } from "@shared/action";
import { GameEvent } from "@shared/event";
import { User } from "@/user";

export interface Broadcasting {
    broadcast(event: GameEvent): void
}

export interface ActionHandling {
    handleAction(user: User, action: Action): void
}