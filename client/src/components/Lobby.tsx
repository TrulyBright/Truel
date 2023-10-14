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
        let updatedRooms: Room[] = []
        let updatedUsers: User[] = []
        Client.instance
        .on(RoomCreated, (event) => {
            updatedRooms = [...updatedRooms, Room.from(event)]
            setRooms(updatedRooms)
        })
        .on(RoomUpdated, (event) => {
            updatedRooms = updatedRooms.map((room) => (room.id === event.id ? Room.from(event) : room))
            setRooms(updatedRooms)
        })
        .on(RoomDeleted, (event) => {
            updatedRooms = updatedRooms.filter((room) => room.id !== event.id)
            setRooms(updatedRooms)
        })
        .on(RoomList, (event) => {
            updatedRooms = event.rooms.map((room) => Room.from(room))
            setRooms(updatedRooms)
        })
        .on(UserCreated, (event) => {
            updatedUsers = [...updatedUsers, User.from(event)]
            setUsers(updatedUsers)
        })
        .on(UserDeleted, (event) => {
            updatedUsers = updatedUsers.filter((user) => user.name !== event.name)
            setUsers(updatedUsers)
        })
        .on(UserList, (event) => {
            updatedUsers = event.users.map((user) => User.from(user))
            setUsers(updatedUsers)
        })
        Client.instance.perform(new GetRooms())
        Client.instance.perform(new GetUsers())
        return () => {
            Client.instance
            .removeListeners(RoomCreated)
            .removeListeners(RoomUpdated)
            .removeListeners(RoomDeleted)
            .removeListeners(RoomList)
            .removeListeners(UserCreated)
            .removeListeners(UserDeleted)
            .removeListeners(UserList)
        }
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