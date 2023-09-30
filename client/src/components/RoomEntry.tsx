import Room from "src/client/room";
import { Card, CardContent, Typography } from "@mui/material";

const RoomEntry = (props: {room: Room}) => {
    return (
        <Card>
            <CardContent>
                <Typography color="text.secondary" gutterBottom>{props.room.members.length} / {props.room.maxMembers}</Typography>
            </CardContent>
        </Card>
    )
}

export default RoomEntry