import { useState } from "react"
import { GetRooms, GetUsers } from "@shared/action"
import Socket from "@/client/socket"
import { RoomCreated, RoomDeleted, RoomList, RoomUpdated, UserCreated, UserDeleted, UserList } from "@shared/event"
import Room from "@/client/room"
import User from "@/client/user"
import Lobby from "@/components/Lobby"

const Game = () => {
    const client = Socket.instance
    const [rooms, setRooms] = useState<Room[]>([])
    const [users, setUsers] = useState<User[]>([])
    client.addEventListener(RoomCreated, (event) => {
        setRooms((rooms) => [...rooms, Room.from(event)])
    })
    client.addEventListener(RoomUpdated, (event) => {
        setRooms(rooms.map((room) => (room.id === event.id ? Room.from(event) : room)))
    })
    client.addEventListener(RoomDeleted, (event) => {
        setRooms(rooms.filter((room) => room.id !== event.id))
    })
    client.addEventListener(RoomList, (event) => {
        setRooms(event.rooms.map((room) => Room.from(room)))
    })
    client.addEventListener(UserCreated, (event) => {
        setUsers((users) => [...users, User.from(event)])
    })
    client.addEventListener(UserDeleted, (event) => {
        setUsers(users.filter((user) => user.name !== event.name))
    })
    client.addEventListener(UserList, (event) => {
        setUsers(event.users.map((user) => User.from(user)))
    })
    client.onOpen(() => {
        client.perform(new GetRooms())
        client.perform(new GetUsers())
    })
    
    return (
        <Lobby users={users} rooms={rooms}></Lobby>
    )
}

export default Game