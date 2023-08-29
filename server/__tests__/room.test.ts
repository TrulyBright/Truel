import { Hub } from "@/hub"
import { User } from "@/user"
import { Room } from "@/room"
import { CreateRoom, JoinRoom, LeaveRoom } from "@shared/action"

// Scenario #1: Create, Join, Leave
// 1. A user joins.
// 2. The user creates a room.
// 3. Another user joins the room.
// 5. The first user (host) leaves the room.
// 6. The second user becomes the host.
// 7. The second user leaves the room.
// 8. The room is destroyed.
test("Scenario #1", () => {
    const hub = new Hub()
    const user1 = new User("user1")
    const user2 = new User("user2")
    const password = "password"
    hub.handleAction(user1, new CreateRoom("room1", 2, password))
    const room = user1.room
    expect(hub.rooms.has(room.id)).toBe(true)
    expect(room).not.toBeNull()
    expect(room).toBeInstanceOf(Room)
    expect(room.title).toBe("room1")
    expect(room.host).toBe(user1)
    expect(room.private).toBe(password !== null)
    expect(room.members).toContain(user1)
    expect(room.members).not.toContain(user2)
    hub.handleAction(user2, new JoinRoom(room!.id, room!.password))
    expect(room.host).toBe(user1)
    expect(room.members).toContain(user1)
    expect(room.members).toContain(user2)
    expect(room.full).toBe(true)
    hub.handleAction(user1, new LeaveRoom())
    expect(room.host).toBe(user2)
    expect(room.members).not.toContain(user1)
    expect(room.members).toContain(user2)
    hub.handleAction(user2, new LeaveRoom())
    expect(room.members).not.toContain(user1)
    expect(room.members).not.toContain(user2)
    expect(hub.rooms.has(room.id)).toBe(false)
    expect(room.empty).toBe(true)
})

// Scenario #2