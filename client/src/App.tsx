import TopBar from "./components/TopBar"
import Socket from "./client/socket"
import { useState } from "react"
import Room from "./client/room"
import { RoomList } from "@shared/event"

const App = () => {
  const client = Socket.instance
  const [rooms, setRooms] = useState<Room[]>([])
  client.addEventListener(RoomList, (event) => {
    setRooms(event.rooms.map(room => Room.from(room)))
  })
  return (
    <>
      <TopBar></TopBar>
    </>
  )
}

export default App