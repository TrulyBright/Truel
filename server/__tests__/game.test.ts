import { Hub } from "@/hub"
import { User } from "@/user"
import { CreateRoom, JoinRoom, Shoot, StartGame } from "@shared/action"

test("Actual game", async () => {
    const hub = new Hub()
    const maxMembers = 8
    const users = [...Array(maxMembers).keys()].map(i => new User(`user${i}`))
    const host = users[0]
    users.forEach(user => hub.addUser(user))
    hub.handleAction(host, new CreateRoom("room1", maxMembers, "password"))
    const room = host.room
    users.filter(user => user !== host).forEach(user => {
        hub.handleAction(user, new JoinRoom(room.id, room.password))
    })
    hub.handleAction(host, new StartGame())
}, 10000 * 10)