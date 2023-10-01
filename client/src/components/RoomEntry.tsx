import Room from "@/client/room";
import { Paper, Typography } from "@mui/material";
import { Lock } from "@mui/icons-material";

const RoomEntry = (props: {room: Room}) => {
    return (
        <Paper sx={{
            textAlign: "center",
            padding: "0.5em",
            backgroundColor: "primary.main",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            <Typography variant="body2">
                {props.room.name}
            </Typography>
            <Typography variant="caption">{props.room.members.length} / {props.room.maxMembers}</Typography>
            <Lock sx={{visibility: props.room.private ? "hidden":"visible"}} />
        </Paper>
    )
}

export default RoomEntry