import { Stack, Box, Typography } from "@mui/material"
import RoomEntry from "@/components/RoomEntry"
import { useState, useEffect } from "react"
import { GetRooms, GetUsers } from "@shared/action"
import Client from "@/client/client"
import { RoomCreated, RoomDeleted, RoomList, RoomUpdated, UserCreated, UserDeleted, UserList } from "@shared/event"
import Room from "@/client/room"
import User from "@/client/user"

const Lobby = () => {
    const [rooms, setRooms] = useState<Room[]>([])
    const [users, setUsers] = useState<User[]>([])
    useEffect(() => {
        Client
        .on(RoomCreated, (event) => {
            setRooms((rooms) => [...rooms, Room.from(event)])
        })
        .on(RoomUpdated, (event) => {
            setRooms(rooms.map((room) => (room.id === event.id ? Room.from(event) : room)))
        })
        .on(RoomDeleted, (event) => {
            setRooms(rooms.filter((room) => room.id !== event.id))
        })
        .on(RoomList, (event) => {
            setRooms(event.rooms.map((room) => Room.from(room)))
        })
        .on(UserCreated, (event) => {
            setUsers((users) => [...users, User.from(event)])
        })
        .on(UserDeleted, (event) => {
            setUsers(users.filter((user) => user.name !== event.name))
        })
        .on(UserList, (event) => {
            setUsers(event.users.map((user) => User.from(user)))
        })
        .waitUntilConnected()
        .then(() => {
            Client.perform(new GetRooms())
            Client.perform(new GetUsers())
        })
        .catch(console.error)
    }, [])
    return (
        <Box sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <Typography>{users.length} users & {rooms.length} rooms online.</Typography>
            <Stack sx={{
                width: "100%",
                padding: "1em",
                boxSizing: "border-box"
            }} spacing={2}>
                {rooms.map((room) => <RoomEntry room={room} key={room.id}></RoomEntry>)}
            </Stack>
        </Box>
    )
}

export default Lobby