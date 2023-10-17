import { Stack, Box, Typography } from "@mui/material"
import RoomEntry from "@/components/RoomEntry"
import { useState, useEffect } from "react"
import { GetRooms, GetUsers } from "@shared/action"
import Client from "@/client/client"
import { RoomCreated, RoomDeleted, RoomList, RoomUpdated, UserCreated, UserDeleted, UserList } from "@shared/event"
import Room from "@/client/room"
import User from "@/client/user"

const Lobby = () => {
    const [rooms, _setRooms] = useState<Room[]>([])
    const [users, _setUsers] = useState<User[]>([])
    useEffect(() => {
        let updatedRooms: Room[] = []
        let updatedUsers: User[] = []
        const setRooms = (rooms: Room[]) => {
            updatedRooms = rooms
            _setRooms(rooms)
        }
        const setUsers = (users: User[]) => {
            updatedUsers = users
            _setUsers(users)
        }
        Client.instance
        .on(RoomCreated, (event) => {
            setRooms([...updatedRooms, event.room as Room])
        })
        .on(RoomUpdated, (event) => {
            setRooms(updatedRooms.map(room => room.id === event.room.id ? event.room as Room : room))
        })
        .on(RoomDeleted, (event) => {
            setRooms(updatedRooms.filter(room => room.id !== event.room.id))
        })
        .on(RoomList, (event) => {
            setRooms(event.rooms.map(room => room as Room))
        })
        .on(UserCreated, (event) => {
            setUsers([...updatedUsers, event.user as User])
        })
        .on(UserDeleted, (event) => {
            setUsers(updatedUsers.filter(user => user.name !== event.user.name))
        })
        .on(UserList, (event) => {
            setUsers(event.users.map(user => user as User))
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