import User from "@/user"
import { Card, Drift } from "@shared/enums"
import { Event } from "@shared/event"
import { EventListening, PlayerCommonInterface } from "@shared/interfaces"

export default class Player implements PlayerCommonInterface {
    alive = true
    cash = 200
    probability = Math.random()
    card: Card | null = Math.floor(Math.random() * 3) as Card
    drift = Drift.Hold
    buff = {
        [Card.Robbery]: false,
        [Card.BulletProof]: false,
        [Card.PatronB]: false,
        [Card.Meditation]: false,
        [Card.Curse]: false,
        [Card.Insurance]: false,
        [Card.LastDitch]: false
    }

    /**
     * Once the player is created, the user's `player` property is set to this.
     * @param user The user that this player represents.
     */
    constructor(
        public readonly user: User
    ) {
        user.player = this
    }

    get name() {
        return this.user.name
    }

    private get userHasNotLeft() {
        return this.user.player === this
    }

    recv<T extends Event>(event: T) {
        if (this.userHasNotLeft) {
            this.user.recv(event)
        }
    }

    reset() {
        this.alive = this.cash > 0
        this.probability = Math.random()
        this.card = Math.floor(Math.random() * 3) as Card
        this.drift = Drift.Hold
        this.buff = {
            [Card.Robbery]: false,
            [Card.BulletProof]: false,
            [Card.PatronB]: false,
            [Card.Meditation]: false,
            [Card.Curse]: false,
            [Card.Insurance]: false,
            [Card.LastDitch]: false
        }
    }
}