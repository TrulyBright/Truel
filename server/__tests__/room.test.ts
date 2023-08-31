import { Hub } from "@/hub"
import { User } from "@/user"
import { Room } from "@/room"
import { CreateRoom, JoinRoom, LeaveRoom } from "@shared/action"
import { GameError, GameEvent, NewHost, RoomCreated, RoomDeleted, UserCreated, UserJoinedRoom, UserLeftRoom } from "@shared/event"

// Scenario #1: Create, Join, Leave
// 1. A user joins.
// 2. The user creates a room.
// 3. Another user joins the room.
// 4. The third user fails to join the room.
// 5. The first user (host) leaves the room.
// 6. The second user becomes the host.
// 7. The second user leaves the room.
// 8. The room is destroyed.
test("Scenario #1", () => {
    const hub = new Hub()
    const user1 = new User("user1")
    const user2 = new User("user2")
    const user3WhoFailsToJoin = new User("user3")
    // 1. A user joins.
    hub.addUser(user1)
    const user1Created = user1.last50Events.findItemOf(UserCreated) as UserCreated
    expect(user1Created.name).toBe(user1.name)
    hub.addUser(user2)
    const user2Created = user1.last50Events.findItemOf(UserCreated) as UserCreated
    expect(user2Created.name).toBe(user2.name)
    user1.last50Events.clear()
    user2.last50Events.clear()
    const title = "room1"
    const maxMembers = 2
    const password = "password"
    // 2. The user creates a room.
    hub.handleAction(user1, new CreateRoom(title, maxMembers, password))
    const room = user1.room
    expect(hub.rooms.has(room.id)).toBe(true)
    expect(room).not.toBeNull()
    expect(room).toBeInstanceOf(Room)
    expect(room.title).toBe(title)
    expect(room.host).toBe(user1)
    expect(room.private).toBe(password !== null)
    expect(room.members).toContain(user1)
    expect(room.members).not.toContain(user2)
    const user1JoinedRoom = user1.last50Events.findItemOf(UserJoinedRoom) as UserJoinedRoom
    expect(user1JoinedRoom.name).toBe(user1.name)
    const roomCreated = user2.last50Events.findItemOf(RoomCreated) as RoomCreated
    expect(roomCreated.id).toBe(room.id)
    expect(roomCreated.maxMembers).toBe(room.maxMembers)
    expect(roomCreated.title).toBe(room.title)
    // 3. Another user joins the room.
    hub.handleAction(user2, new JoinRoom(room.id, room.password))
    expect(room.host).toBe(user1)
    expect(room.members).toContain(user1)
    expect(room.members).toContain(user2)
    expect(room.full).toBe(true)
    room.members.forEach(member => {
        const user2JoinedRoom = member.last50Events.findItemOf(UserJoinedRoom) as UserJoinedRoom
        expect(user2JoinedRoom.name).toBe(user2.name)
    })
    // 4. The third user fails to join the room.
    hub.handleAction(user3WhoFailsToJoin, new JoinRoom(room.id, null))
    expect(room.members).not.toContain(user3WhoFailsToJoin)
    const errorToUser3 = user3WhoFailsToJoin.last50Events.findItemOf(GameError) as GameError
    expect(errorToUser3.code).toBe(1003)
    // 5. The first user (host) leaves the room.
    hub.handleAction(user1, new LeaveRoom())
    expect(user1.room).toBeNull()
    expect(room.members).not.toContain(user1)
    const user1LeftRoom = user2.last50Events.findItemOf(UserLeftRoom) as UserLeftRoom
    expect(user1LeftRoom.name).toBe(user1.name)
    // 6. The second user becomes the host.
    expect(room.host).toBe(user2)
    expect(room.members).toContain(user2)
    const user2NewHost = user2.last50Events.findItemOf(NewHost) as NewHost
    expect(user2NewHost.name).toBe(user2.name)
    // 7. The second user leaves the room.
    hub.handleAction(user2, new LeaveRoom())
    expect(user2.room).toBeNull()
    expect(room.members).not.toContain(user1)
    expect(room.members).not.toContain(user2)
    expect(room.empty).toBe(true)
    // 8. The room is destroyed.
    expect(hub.rooms.has(room.id)).toBe(false)
    hub.users.forEach(user => {
        const roomDeleted = user.last50Events.findItemOf(RoomDeleted) as RoomDeleted
        expect(roomDeleted.id).toBe(room.id)
    })
})