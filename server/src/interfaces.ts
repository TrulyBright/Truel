import { GameEvent } from "@shared/event";

export interface Broadcasting {
    broadcast(event: GameEvent): void
}