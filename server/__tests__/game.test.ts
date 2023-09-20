import { Game } from "@/game"
import { Hub } from "@/hub"
import { User } from "@/user"
import { CreateRoom, DrawCard, JoinRoom, PlayCard, Shoot, StartGame } from "@shared/action"
import { GameEvent, NowTurnOf, UserDead, UserShot, YouDied, YourTurn } from "@shared/event"

test("Actual game", async () => {
    Game.turnTimeLimit = 1 // speed up the game
    const hub = new Hub()
    const maxMembers = 3
    const users = [...Array(maxMembers).keys()].map(i => new User(`user${i}`))
    const host = users[0]
    users.forEach(user => hub.addUser(user))
    hub.emit(CreateRoom.name, host, new CreateRoom("room1", maxMembers, "password"))
    const room = host.room
    users.filter(user => user !== host).forEach(user => {
        hub.emit(JoinRoom.name, user, new JoinRoom(room.id, room.password))
    })
    users.forEach(user => {
        user.on("GameEvent", (event: GameEvent) => {
            if (event instanceof YourTurn) {
                room.game.players.forEach(p => {
                    const nowTurnOf = p.last50Events.findItemOf(NowTurnOf) as NowTurnOf
                    expect(nowTurnOf.name).toBe(room.game.currentPlayer.name)
                })
                room.game.once(Shoot.name, (shooting: User, action: Shoot) => {
                    room.game.players.forEach(p => {
                        const userShot = p.last50Events.findItemOf(UserShot) as UserShot
                        expect(userShot.shooting).toBe(shooting.name)
                        expect(userShot.target).toBe(action.target)
                        const target = room.game.players.find(p => p.name === action.target)
                        if (!target.alive) {
                            const userDead = p.last50Events.findItemOf(UserDead) as UserDead
                            expect(userDead.name).toBe(action.target)
                            if (p === target) {
                                const youDied = p.last50Events.findItemOf(YouDied) as YouDied
                                expect(youDied).toBeTruthy()
                            }
                        }
                    })
                })
            }
        })
    })
    hub.emit(StartGame.name, host, new StartGame())
    await room.game.task
    expect(room.game).toBeNull()
}, 10000)