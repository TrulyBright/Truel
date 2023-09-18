import { User } from "@/user"
import { EventEmitter } from "node:events"
import { Broadcasting } from "@/interfaces"
import { BulletProofBroken, CardPlayed, GameError, GameEvent, NewCard, NewDrift, NewRound, NowTurnOf, UserDead, UserDrewCard, UserShot, YouDied, YourTurn } from "@shared/event"
import { Action, ChangeDrift, DrawCard, PlayCard, Shoot, actionConstructors } from "@shared/action"
import { Card } from "@shared/enums"

export class Game extends EventEmitter implements Broadcasting {
    static turnTimeLimit = 10000 // ms
    static readonly rounds = 4
    currentPlayer: User
    constructor(
        public players: User[],
    ) {
        super()
    }

    broadcast(event: GameEvent): void {
        this.players.forEach(player => player.recv(event))
    }

    async start() {
        this.players.forEach(p => p.resetForNewGame())
        for (let i = 1; i <= Game.rounds; i++) await this.playRound(i)
    }

    async playRound(roundNo: number) {
        console.log(`Round ${roundNo} starts`)
        this.broadcast(new NewRound(roundNo))
        this.players.forEach(p => p.resetForNewRound())
        this.currentPlayer = this.players[0]
        while (this.survivors.length > 1) {
            console.log(`Now turn of ${this.currentPlayer.name}`)
            this.broadcast(new NowTurnOf(this.currentPlayer.name))
            this.currentPlayer.recv(new YourTurn())
            await this.playTurn()
        }
    }

    async playTurn() {
        const performed: Shoot | DrawCard = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                // On timeout, shoot at a random player
                const target = this.players[Math.floor(Math.random() * this.players.length)]
                resolve(new Shoot(target.name))
            }, Game.turnTimeLimit)
            const finisher = (user: User, action: Action) => {
                clearTimeout(timeout)
                resolve(action)
            }
            this.once(Shoot.name, finisher)
            this.once(DrawCard.name, finisher)
        })
        if (performed instanceof Shoot) this.handleShoot(this.currentPlayer, performed)
        else this.handleDrawCard(this.currentPlayer, performed)
    }

    emitShoot(user: User, action: Shoot) {
        if (this.currentPlayer !== user) return
        if (!this.players.find(p => p.name === action.target)) {
            user.recv(new GameError(1004))
            return
        }
        this.emit(Shoot.name, user, action)
    }

    emitDrawCard(user: User, action: DrawCard) {
        if (this.currentPlayer !== user) return
        this.emit(DrawCard.name, user, action)
    }

    handleShoot(user: User, action: Shoot) {
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

    handleDrawCard(user: User, action: DrawCard) {
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