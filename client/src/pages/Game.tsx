import { useState, useEffect } from "react"
import Client from "@/client/client"
import Lobby from "@/components/Lobby"
import Loading from "@/components/Loading"
import { YouAreInLobby, YouAreInRoom } from "@shared/event"
import RoomInside from "@/components/RoomInside"

type CurrentState = "lobby" | "room" | "game"

const Game = () => {
    const [connectionEstablished, setConnectionEstablished] = useState(false)
    const [connectionClosed, setConnectionClosed] = useState(false)
    const [currentState, setCurrentState] = useState<CurrentState>("lobby")
    useEffect(() => {
        Client.instance
        .on(YouAreInRoom, () => {
            setCurrentState("room")
        })
        .on(YouAreInLobby, () => {
            setCurrentState("lobby")
        })
        .connect()
        .onDisconnect(() => {
            setConnectionEstablished(false)
            setConnectionClosed(true)
        })
        .assureConnected()
        .then(() => setConnectionEstablished(true))
        return () => {
            Client.instance.disconnect()
            Client.instance
        }
    }, [])
    return !connectionEstablished
    ? <Loading message={connectionClosed ? "Reconnecting to the server..." : "Waiting for the connection to the server to be established..."} />
    : currentState === "lobby"
    ? <Lobby />
    : <RoomInside />
}

export default Game