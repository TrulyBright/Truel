import { useState } from "react"
import Room from "@/client/room";
import { Paper, Typography } from "@mui/material";
import { Lock } from "@mui/icons-material";
import RoomPasswordPrompt from "@/components/RoomPasswordPrompt";
import Client from "@/client/client";
import { JoinRoom } from "@shared/action";

const RoomEntry = (props: {room: Room}) => {
    const [passwordPromptOpen, setPasswordPromptOpen] = useState(false)
    return (
        <>
            <Paper sx={{
                textAlign: "center",
                padding: "0.5em",
                backgroundColor: "primary.main",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                "&:hover": {
                    boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
                    cursor: "pointer"
                }
            }} onClick={() => {
                if (props.room.isPrivate) setPasswordPromptOpen(true)
                else Client.instance.perform(new JoinRoom(props.room.id, null))
            }}>
                <Typography variant="body2">
                    {props.room.name}
                </Typography>
                <Typography variant="caption">{props.room.members.length} / {props.room.maxMembers}</Typography>
                <Lock sx={{visibility: props.room.isPrivate ? "visible":"hidden"}} />
            </Paper>
            {passwordPromptOpen ? <RoomPasswordPrompt room={props.room} promptOpen={passwordPromptOpen} setPromptOpen={setPasswordPromptOpen}/> : null}
        </>
    )
}

export default RoomEntry