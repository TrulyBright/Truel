import { Game } from "@/game"
import { Hub } from "@/hub"
import { User } from "@/user"
import { CreateRoom, DrawCard, JoinRoom, PlayCard, Shoot, StartGame } from "@shared/action"
import { NowTurnOf, UserDead, UserShot, YouDied, YourTurn } from "@shared/event"

test("Actual game", async () => {
    Game.turnTimeLimit = 1 // speed up the game
    const hub = new Hub()
    const maxMembers = 3
    const users = [...Array(maxMembers).keys()].map(i => new User(`user${i}`))
    const host = users[0]
    users.forEach(user => hub.addUser(user))
    hub.handleAction(host, new CreateRoom("room1", maxMembers, "password"))
    const room = host.room
    users.filter(user => user !== host).forEach(user => {
        hub.handleAction(user, new JoinRoom(room.id, room.password))
    })
    hub.handleAction(host, new StartGame())
    const game = host.room.game
    for (let i = 0; i < Game.rounds; i++) {
        while (game.survivors.length > 1) {
            game.players.forEach(p => {
                const nowTurnOf = p.last50Events.findItemOf(NowTurnOf) as NowTurnOf
                expect(nowTurnOf.name).toBe(game.currentPlayer.name)
                if (p === game.currentPlayer) {
                    const yourTurn = p.last50Events.findItemOf(YourTurn) as YourTurn
                    expect(yourTurn).toBeTruthy()
                }
            })
            const shooting = game.currentPlayer
            const target = game.survivors.filter(u => u !== shooting)[0]
            const action = new Shoot(target.name)
            hub.handleAction(shooting, action)
            await game.turnPromise
            game.players.forEach(p => {
                const userShot = p.last50Events.findItemOf(UserShot) as UserShot
                expect(userShot.shooting).toBe(shooting.name)
                expect(userShot.target).toBe(action.target)
                if (!target.alive) {
                    const userDead = p.last50Events.findItemOf(UserDead) as UserDead
                    expect(userDead.name).toBe(action.target)
                    if (p === target) {
                        const youDied = p.last50Events.findItemOf(YouDied) as YouDied
                        expect(youDied).toBeTruthy()
                    }
                }
            })
            await undefined // give control to the event loop which will then give that to the game.start() or game.playRound().
        }
    }
}, 10000)