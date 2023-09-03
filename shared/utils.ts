export class Queue<T> {
    private elements: Record<number, T> = {}
    private head: number = 0
    private tail: number = 0

    get length() {
        return this.tail - this.head
    }

    get empty() {
        return this.length === 0
    }

    enqueue(element: T): void {
        this.elements[this.tail] = element
        this.tail++
    }

    dequeue(): T {
        const item = this.elements[this.head]
        delete this.elements[this.head]
        this.head++
        return item
    }

    clear(): void {
        while (!this.empty) this.dequeue()
    }

    findItemOf(targetType: Function): T {
        while (!this.empty) {
            const popped = this.dequeue()
            if (popped.constructor === targetType) return popped
        }
        throw new Error(`${targetType.name} is not in the queue.`)
    }
}

export const withTimeout = <T>(millis: number, promise: Promise<T>) => {
    const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(`Timed out in ${millis} ms.`), millis)
    })
    return Promise.race([promise, timeout])
}