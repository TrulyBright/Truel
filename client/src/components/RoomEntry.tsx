import Room from "@/client/room";
import { Card, CardContent, Typography } from "@mui/material";

const RoomEntry = (props: {room: Room}) => {
    return (
        <Card>
            <CardContent>
                <Typography color="text.secondary" gutterBottom>{props.room.members.length} / {props.room.maxMembers}</Typography>
                <Typography variant="h5" component="div">{props.room.name}</Typography>
                <Typography color="text.secondary">{props.room.host.name}</Typography>
            </CardContent>
        </Card>
    )
}

export default RoomEntry