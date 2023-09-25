import { Event } from "@shared/event";

export interface Broadcasting {
    broadcast(event: Event): void
}