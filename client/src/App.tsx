import { useState } from "react"
import TopBar from "@/components/TopBar"
import Socket from "@/client/socket"
import { RoomCreated, RoomDeleted, RoomList, RoomUpdated } from "@shared/event"
import { GetRooms, GetUsers } from "@shared/action"
import Room from "@/client/room"
import RoomEntry from "@/components/RoomEntry"

const App = () => {
    const client = Socket.instance
    const [rooms, setRooms] = useState<Room[]>([])
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
    client.onOpen(() => {
        client.perform(new GetRooms())
        client.perform(new GetUsers())
    })
    return (
        <>
            <TopBar></TopBar>
            {rooms.map((room) => <RoomEntry room={room} key={room.id}></RoomEntry>)}
        </>
    )
}

export default App