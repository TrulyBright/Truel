import { Stack, Box, Typography } from "@mui/material"
import RoomEntry from "@/components/RoomEntry"
import Room from "@/client/room"
import User from "@/client/user"

const Lobby = (props: {users: User[], rooms: Room[]}) => {
    return (
        <Box sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <Typography>{props.users.length} users & {props.rooms.length} rooms online.</Typography>
            <Stack sx={{
                width: "100%",
                padding: "1em",
                boxSizing: "border-box"
            }} spacing={2}>
                {props.rooms.map((room) => <RoomEntry room={room} key={room.id}></RoomEntry>)}
            </Stack>
        </Box>
    )
}

export default Lobby