import { Game } from "@/game"
import { Hub } from "@/hub"
import { User } from "@/user"
import { CreateRoom, DrawCard, JoinRoom, PlayCard, Shoot, StartGame } from "@shared/action"
import { CardPlayed, GameEvent, NowTurnOf, UserDead, UserShot, YouDied, YourTurn } from "@shared/event"

test("Actual game", async () => {
    const maxMembers = 8
    expect.assertions(
        (
            (maxMembers - 1) * maxMembers // expect NowTurnOf
            + (maxMembers - 1) // expect(room.game.currentPlayer).toBe(user)
            + (maxMembers - 1) * (maxMembers * 3 + 1) // expect userShot.shooting, userShot,target, userDead
        )
        * Game.rounds
        + 1 // expect(room.game).toBe(null)
    )
    Game.turnTimeLimit = 1 // speed up the game
    const hub = new Hub()
    const users = [...Array(maxMembers).keys()].map(i => new User(`user${i}`))
    const host = users[0]
    users.forEach(user => hub.addUser(user))
    hub.emit(CreateRoom.name, host, new CreateRoom("room1", maxMembers, "password"))
    const room = host.room
    users.filter(user => user !== host).forEach(user => {
        hub.emit(JoinRoom.name, user, new JoinRoom(room.id, room.password))
    })
    users.forEach(user => {
        user.on(NowTurnOf.name, (event: NowTurnOf) => {
            expect(event.name).toBe(room.game.currentPlayer.name)
        })
        // TODO: on CardPlayed, etc.
        user.on(YourTurn.name, (event: YourTurn) => {
            expect(room.game.currentPlayer).toBe(user)
            room.game.turnActionListener.once(Shoot.name, (shooting: User, action: Shoot) => {
                users.forEach(u => {
                    const userShot = u.last50Events.findItemOf(UserShot) as UserShot
                    expect(userShot.shooting).toBe(shooting.name)
                    expect(userShot.target).toBe(action.target)
                    const target = room.game.players.find(p => p.name === action.target)
                    if (!target.alive) {
                        const userDead = u.last50Events.findItemOf(UserDead) as UserDead
                        expect(userDead.name).toBe(action.target)
                        if (u === target) {
                            const youDied = u.last50Events.findItemOf(YouDied) as YouDied
                            expect(youDied).toBeTruthy()
                        }
                    }
                })
            })
            user.probability = 1 // testing purpose
            hub.emit(Shoot.name, user, Shoot.from(room.game.survivors.filter(p => p !== user)[0]))
        })
    })
    hub.emit(StartGame.name, host, new StartGame())
    await room.game.task
    expect(room.game).toBeNull()
}, 10000)