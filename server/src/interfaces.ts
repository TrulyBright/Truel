import { Action } from "@shared/action";
import { GameEvent } from "@shared/event";
import { User } from "@/user";

export interface Broadcasting {
    broadcast(event: GameEvent): void
}