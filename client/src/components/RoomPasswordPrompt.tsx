import { useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material"
import Room from "@/client/room"
import Client from "@/client/client"
import { JoinRoom } from "@shared/action"
import { GameError, YouAreInRoom } from "@shared/event"
import { ErrorCode } from "@shared/enums"

const RoomPasswordPrompt = (props: {room: Room, promptOpen: boolean, setPromptOpen: React.Dispatch<React.SetStateAction<boolean>>}) => {
    const [password, setPassword] = useState<string | null>(null)
    const [passwordWrong, setPasswordWrong] = useState(false)
    const close = () => props.setPromptOpen(false)
    const onEntrySuccess = (event: YouAreInRoom) => {
        close()
        Client.instance.off(GameError, onEntryFailure)
    }
    const onEntryFailure = (event: GameError) => {
        if (event.code === ErrorCode.WrongPassword) {
            setPasswordWrong(true)
            Client.instance.off(YouAreInRoom, onEntrySuccess)    
        }
    }
    return (
        <Dialog open={props.promptOpen} onClose={close}>
            <DialogTitle>Room Entry</DialogTitle>
            <DialogContent>
                <DialogContentText>This room has a password.</DialogContentText>
                <TextField
                    required
                    autoFocus
                    fullWidth
                    error={passwordWrong}
                    margin="dense"
                    label="password"
                    type="password"
                    onChange={(event) => {
                        setPassword(event.target.value)
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>Cancel</Button>
                <Button onClick={() => {
                    Client.instance
                    .once(YouAreInRoom, onEntrySuccess)
                    .once(GameError, onEntryFailure)
                    .perform(new JoinRoom(props.room.id, password))
                }}>Join</Button>
            </DialogActions>
        </Dialog>
    )
}

export default RoomPasswordPrompt