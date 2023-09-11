import { User } from "@/user"
import { ActionHandling, Broadcasting } from "@/interfaces"
import { BulletProofBroken, CardPlayed, GameError, GameEvent, NewCard, NewDrift, NewRound, NowTurnOf, UserDead, UserDrewCard, UserShot, YouDied, YourTurn } from "@shared/event"
import { Action, ChangeDrift, DrawCard, PlayCard, Shoot } from "@shared/action"
import { withTimeout } from "@shared/utils"
import { Card } from "@shared/enums"

export class Game implements ActionHandling, Broadcasting {
    superActionHandler: ActionHandling
    static turnTimeLimit = 10000 // ms
    static readonly rounds = 4
    currentPlayer: User
    task: Promise<void> | null = null
    turnPromise: Promise<Action>
    constructor(
        public players: User[],
    ) { }

    broadcast(event: GameEvent): void {
        this.players.forEach(player => player.recv(event))
    }

    async start() {
        this.players.forEach(p => p.setSuperActionHandler(this))
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
            const turnStartedAt = Date.now()
            this.turnPromise = withTimeout(Game.turnTimeLimit, this.currentPlayer.waitForAction([Shoot, DrawCard, PlayCard]))
            let actionPerformed = undefined
            try {
                actionPerformed = await this.turnPromise
            } catch (e) {
                actionPerformed = null
            }
            if (actionPerformed instanceof PlayCard) {
                this.handlePlayCard(this.currentPlayer, actionPerformed)
                if (this.currentPlayer.has_run) continue
                else {
                    const timeLeft = Game.turnTimeLimit - (Date.now() - turnStartedAt)
                    this.turnPromise = withTimeout(timeLeft, this.currentPlayer.waitForAction([Shoot, DrawCard]))
                    actionPerformed = await this.turnPromise
                }
            }
            if (actionPerformed instanceof Shoot && actionPerformed.target !== this.currentPlayer.name) {
                this.handleShoot(this.currentPlayer, actionPerformed)
            } else if (actionPerformed instanceof DrawCard) {
                this.handleDrawCard(this.currentPlayer, actionPerformed)
            } else { // It's a timeout or an illegal Shoot Action. Shoot at a random player
                const theOthers = this.survivors.filter(u => u !== this.currentPlayer)
                const target = theOthers[Math.floor(Math.random() * theOthers.length)]
                this.handleShoot(this.currentPlayer, new Shoot(target.name))
            }
            const nextPlayerIndex = this.survivors.indexOf(this.currentPlayer) + 1
            this.currentPlayer = this.survivors[nextPlayerIndex % this.survivors.length]
            console.log("Survivors: " + this.survivors.map(p => p.name).join(", "))
        }
    }

    handleShoot(user: User, action: Shoot) {
        const target = this.players.find(p => p.name === action.target)
        if (!target) {
            user.recv(new GameError(1004))
            return
        }
        console.log(`${user.name} shoots at ${action.target}`)
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

    handleAction(user: User, action: Action): void {
        console.log(`Game handles ${action.constructor.name} from ${user.name}`)
        switch (action.constructor) {
            case Shoot:
            case DrawCard:
            case PlayCard:
                break // Let `playRound()` handle it
            case ChangeDrift:
                const changeDrift = action as ChangeDrift
                this.handleChangeDrift(user, changeDrift)
            default:
                this.superActionHandler!.handleAction(user, action)
        }
    }

    setSuperActionHandler(handler: ActionHandling): void {
        this.superActionHandler = handler
    }

    unsetSuperActionHandler(): void {
        this.superActionHandler = null
    }

    handlePlayCard(user: User, action: PlayCard) {
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
            default: // ??? This should never happen
                throw new Error("Unknown card: " + user.card)
        }
        console.log(`${user.name} plays ${user.card}`)
        user.card = null
        this.broadcast(new CardPlayed(user.name, user.card))
    }

    handleChangeDrift(user: User, action: ChangeDrift) {
        user.drift = action.drift
        user.recv(new NewDrift(user.drift))
    }

    get survivors() { return this.players.filter(p => p.alive) }
}