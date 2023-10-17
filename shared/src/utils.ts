import { Event, EventConstructor } from "@/event"

export class Queue {
    private elements: Record<number, Event> = {}
    private head: number = 0
    private tail: number = 0

    get length() {
        return this.tail - this.head
    }

    get empty() {
        return this.length === 0
    }

    enqueue<T extends Event>(element: T): void {
        this.elements[this.tail] = element
        this.tail++
    }

    dequeue() {
        const item = this.elements[this.head]
        delete this.elements[this.head]
        this.head++
        return item
    }

    clear(): void {
        while (!this.empty) this.dequeue()
    }

    findItemOf<V extends Event>(targetType: EventConstructor<V>): V {
        while (!this.empty) {
            const popped = this.dequeue()
            if (popped instanceof targetType) return popped
        }
        throw new Error(`${targetType.name} is not in the queue.`)
    }
}