import { Event } from "@shared/event"
import { ActionHandling, Broadcasting } from "@/interfaces"
import { ChangeDrift, DrawCard, InGameAction, PlayCard, Shoot } from "@shared/action"
import { Card } from "@shared/enums"
import Player from "@/player"
import { EventEmitter } from "node:events"
import { NewRound, NowTurnOf, YourTurn, PlayerShot, BulletProofBroken, PlayerDead, YouDied, NewCard, PlayerDrewCard, CardPlayed, NewDrift } from "@shared/event"

/**
 * `Game` does not care what `Room` or `User` is.
 */
export default class Game extends ActionHandling<Player, InGameAction> implements Broadcasting {
    static turnTimeLimit = 10000 // ms
    static readonly rounds = 4
    task?: Promise<void>
    currentPlayer?: Player
    /**
     * `turnBlocker` is used to block the current turn until the player performs either `Shoot` or `DrawCard`.
     */
    readonly turnBlocker = new EventEmitter()
    constructor(
        public players: Player[],
        public readonly broadcaster: Broadcasting
    ) {
        super()
        this
        .on(Shoot, this.onShoot.bind(this))
        .on(DrawCard, this.onDrawCard.bind(this))
        .on(PlayCard, this.onPlayCard.bind(this))
        .on(ChangeDrift, this.onChangeDrift.bind(this))
    }

    get survivors() { return this.players.filter(p => p.alive) }
    get nextSurvivor() { return this.survivors[(this.survivors.indexOf(this.currentPlayer!) + 1) % this.survivors.length] }
    get randomSurvivor() { return this.players[Math.floor(Math.random() * this.players.length)] }

    /**
     * `Game` shares broadcast function with `Room`.
     * This way, anyone in the room can observe the game, even if they are not playing the game.
     * @param event Event to broadcast.
     */
    broadcast(event: Event): void {
        this.broadcaster.broadcast(event)
    }

    start() {
        const run = async () => {
            this.players.forEach(p => p.reset())
            for (let i = 1; i <= Game.rounds; i++) await this.playRound(i)
        }
        this.task = run()
    }

    private async playRound(roundNo: number) {
        console.log(`Round ${roundNo} starts`)
        this.broadcast(new NewRound(roundNo))
        this.players.forEach(p => p.reset())
        this.currentPlayer = this.survivors[0]
        while (this.survivors.length > 1) {
            await this.playTurn()
            this.currentPlayer = this.nextSurvivor
        }
    }
    
    /**
     * Block for 10 seconds or until the player performs either `Shoot` or `DrawCard`, whichever is earlier.
     */
    private async playTurn() {
        this.broadcast(new NowTurnOf(this.currentPlayer!))
        await new Promise<void>(resolve => {
            const timeout = setTimeout(() => {
                this.onShoot(this.currentPlayer!, Shoot.from(this.randomSurvivor))
                resolve()
            }, Game.turnTimeLimit)
            const finish = () => {
                clearTimeout(timeout)
                resolve()
            }
            this.turnBlocker
            .once(Shoot.name, (shooting: Player, target: Player) => {
                this.actuallyShoot(shooting, target)
                finish()
            })
            .once(DrawCard.name, (drawing: Player) => {
                this.actuallyDrawCard(drawing)
                finish()
            })
            this.currentPlayer!.recv(new YourTurn())
        })
        this.turnBlocker
        .removeAllListeners(Shoot.name)
        .removeAllListeners(DrawCard.name)
    }

    private onShoot(player: Player, action: Shoot) {
        if (this.currentPlayer !== player) return
        const target = this.survivors.find(p => p.name === action.target)!
        this.turnBlocker.emit(Shoot.name, player, target)
    }

    private onDrawCard(player: Player, action: DrawCard) {
        if (this.currentPlayer !== player) return
        this.turnBlocker.emit(DrawCard.name, player)
    }

    private actuallyShoot(shooting: Player, target: Player) {
        this.broadcast(new PlayerShot(shooting, target))
        if (shooting.probability > Math.random()) {
            if (target.buff[Card.BulletProof]) {
                target.buff[Card.BulletProof] = false
                this.broadcast(new BulletProofBroken(target))
            } else {
                target.alive = false
                this.broadcast(new PlayerDead(target))
                target.recv(new YouDied())
            }
        }
    }

    private actuallyDrawCard(drawing: Player) {
        const pool = Object.keys(Card).map(k => Card[k as keyof typeof Card])
        const card = pool[Math.floor(Math.random() * pool.length)]
        drawing.card = card
        drawing.recv(new NewCard(card))
        this.broadcast(new PlayerDrewCard(drawing))
    }

    private onPlayCard(playing: Player, action: PlayCard) {
        if (this.currentPlayer !== playing) return
        switch (playing.card) {
            case Card.Robbery:
            case Card.BulletProof:
            case Card.PatronB:
            case Card.Meditation:
            case Card.Curse:
            case Card.Insurance:
            case Card.LastDitch:
                playing.buff[playing.card] = true
                break
            case Card.Run:
                throw new Error("Not implemented")
        }
        this.broadcast(new CardPlayed(playing, playing.card!))
        playing.card = null
    }

    private onChangeDrift(changing: Player, action: ChangeDrift) {
        if (!this.survivors.includes(changing)) return
        changing.drift = action.drift
        changing.recv(new NewDrift(changing.drift))
    }
}