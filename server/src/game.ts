import { User } from "@/user"
import { EventEmitter } from "node:events"
import { Broadcasting } from "@/interfaces"
import { BulletProofBroken, CardPlayed, GameError, GameEvent, NewCard, NewDrift, NewRound, NowTurnOf, UserDead, UserDrewCard, UserShot, YouDied, YourTurn } from "@shared/event"
import { Action, ChangeDrift, DrawCard, PlayCard, Shoot, actionConstructors } from "@shared/action"
import { Card } from "@shared/enums"

export class Game extends EventEmitter implements Broadcasting {
    static turnTimeLimit = 10000 // ms
    static readonly rounds = 4
    task: Promise<void>
    currentPlayer: User
    turnActionListener = new EventEmitter()
    constructor(
        public players: User[],
        public readonly broadcaster: Broadcasting
    ) {
        super()
        this.on(Shoot.name, this.emitShoot)
        this.on(DrawCard.name, this.emitDrawCard)
        this.on(PlayCard.name, this.handlePlayCard)
        this.on(ChangeDrift.name, this.handleChangeDrift)
    }

    broadcast(event: GameEvent): void {
        this.broadcaster.broadcast(event)
    }

    async start() {
        this.players.forEach(p => p.resetForNewGame())
        for (let i = 1; i <= Game.rounds; i++) await this.playRound(i)
    }

    private async playRound(roundNo: number) {
        console.log(`Round ${roundNo} starts`)
        this.broadcast(new NewRound(roundNo))
        this.players.forEach(p => p.resetForNewRound())
        this.currentPlayer = this.survivors[0]
        while (this.survivors.length > 1) {
            await this.playTurn()
            this.currentPlayer = this.survivors[(this.survivors.indexOf(this.currentPlayer) + 1) % this.survivors.length]
        }
    }

    private async playTurn() {
        console.log(`Now turn of ${this.currentPlayer.name}`)
        this.broadcast(new NowTurnOf(this.currentPlayer.name))
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                // On timeout, shoot at a random player
                console.log(`${this.currentPlayer.name} timed out`)
                const target = this.players[Math.floor(Math.random() * this.players.length)]
                this.handleShoot(this.currentPlayer, Shoot.from(target))
                resolve()
            }, Game.turnTimeLimit)
            const finish = () => {
                clearTimeout(timeout)
                resolve()
            }
            this.turnActionListener
            .prependOnceListener(Shoot.name, (user: User, action: Shoot) => {
                this.handleShoot(user, action)
                finish()
            })
            .prependOnceListener(DrawCard.name, (user: User, action: DrawCard) => {
                this.handleDrawCard(user, action)
                finish()
            })
            this.currentPlayer.recv(new YourTurn())
        })
        this.turnActionListener
        .removeAllListeners(Shoot.name)
        .removeAllListeners(DrawCard.name)
    }

    emitShoot(user: User, action: Shoot) {
        if (this.currentPlayer !== user) return
        if (!this.survivors.find(p => p.name === action.target)) {
            user.recv(new GameError(1004))
            return
        }
        this.turnActionListener.emit(Shoot.name, user, action)
    }

    emitDrawCard(user: User, action: DrawCard) {
        if (this.currentPlayer !== user) return
        this.turnActionListener.emit(DrawCard.name, user, action)
    }

    private handleShoot(user: User, action: Shoot) {
        console.log(`${user.name} shoots at ${action.target}`)
        const target = this.players.find(p => p.name === action.target)
        this.broadcast(new UserShot(user.name, target.name))
        if (user.probability > Math.random()) {
            if (target.buff[Card.BulletProof]) {
                target.buff[Card.BulletProof] = false
                this.broadcast(new BulletProofBroken(target.name))
            } else {
                target.alive = false
                this.broadcast(new UserDead(target.name))
                target.recv(new YouDied())
            }
        }
    }

    private handleDrawCard(user: User, action: DrawCard) {
        console.log(`${user.name} draws a card`)
        // Get a random card
        const pool = Object.keys(Card).map(k => Card[k as keyof typeof Card])
        const card = pool[Math.floor(Math.random() * pool.length)]
        user.card = card
        user.recv(new NewCard(card))
        this.broadcast(new UserDrewCard(user.name))
    }

    handlePlayCard(user: User, action: PlayCard) {
        if (this.currentPlayer !== user) return
        console.log(`${user.name} plays ${user.card}`)
        switch (user.card) {
            case Card.Robbery:
            case Card.BulletProof:
            case Card.PatronB:
            case Card.Meditation:
            case Card.Curse:
            case Card.Insurance:
            case Card.LastDitch:
                user.buff[user.card] = true
                break
            case Card.Run:
                user.has_run = true
            default:
                throw new Error("Unknown card: " + user.card)
        }
        user.card = null
        this.broadcast(new CardPlayed(user.name, user.card))
    }

    handleChangeDrift(user: User, action: ChangeDrift) {
        if (!this.players.includes(user)) return
        user.drift = action.drift
        user.recv(new NewDrift(user.drift))
    }

    get survivors() { return this.players.filter(p => p.alive) }
}