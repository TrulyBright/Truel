import Game from "@/game"
import Hub from "@/hub"
import Player from "@/player"
import User from "@/user"
import { CreateRoom, JoinRoom, Shoot, StartGame } from "@shared/action"
import { NowTurnOf, YourTurn, YouDied, PlayerShot, PlayerDead } from "@shared/event"

test("Actual game", async () => {
    const maxMembers = 8
    expect.assertions(
        (
            (maxMembers - 1) * maxMembers // expect NowTurnOf
            + (maxMembers - 1) // expect(room.game.currentPlayer).toBe(user)
            + (maxMembers - 1) * (maxMembers * 3 + 1) // expect PlayerShot.Shooting, PlayerShot,target, PlayerDead
        )
        * Game.rounds
        + 1 // expect(room.game).toBe(null)
    )
    Game.turnTimeLimit = 1 // speed up the game
    const hub = new Hub()
    const users = [...Array(maxMembers).keys()].map(i => new User(`user${i}`))
    const host = users[0]
    users.forEach(user => hub.addUser(user))
    hub.handle(host, new CreateRoom("room1", maxMembers, "password"))
    const room = host.room!
    users.filter(user => user !== host).forEach(user => {
        hub.handle(user, new JoinRoom(room.id, room.password))
    })
    users.forEach(user => {
        user
        .on(NowTurnOf, (event) => {
            expect(event.name).toBe(room.game!.currentPlayer!.name)
        })
        .on(YourTurn, (event) => {
            expect(room.game!.currentPlayer).toBe(user.player)
            room.game!.turnBlocker.once(Shoot.name, (shooting: Player, target: Player) => {
                users.forEach(u => {
                    const ps = u.last50Events.findItemOf(PlayerShot)
                    expect(ps.shooting).toBe(shooting.name)
                    expect(ps.target).toBe(target.name)
                    if (!target.alive) {
                        const pd = u.last50Events.findItemOf(PlayerDead)
                        expect(pd.name).toBe(target.name)
                        if (u.player === target) {
                            const yd = u.last50Events.findItemOf(YouDied)
                            expect(yd).toBeTruthy()
                        }
                    }
                })
            })
            user.player!.probability = 1 // testing purpose
            hub.handle(user, Shoot.from(room.game!.survivors.filter(p => p !== user.player)[0]))
        })
    })
    hub.handle(host, new StartGame())
    await room.game!.task
    expect(room.game).toBeNull()
})