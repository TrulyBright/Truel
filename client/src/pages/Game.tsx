import { useState, useEffect } from "react"
import Client from "@/client/client"
import Lobby from "@/components/Lobby"
import Loading from "@/components/Loading"

const Game = () => {
    const [connectionEstablished, setConnectionEstablished] = useState(false)
    const [connectionClosed, setConnectionClosed] = useState(false)
    useEffect(() => {
        Client.instance
        .connect()
        .onDisconnect(() => {
            setConnectionEstablished(false)
            setConnectionClosed(true)
        })
        .assureConnected()
        .then(() => setConnectionEstablished(true))
        return () => Client.instance.disconnect()
    }, [])
    return connectionEstablished
    ? <Lobby />
    : <Loading message={connectionClosed ? "Reconnecting to the server..." : "Waiting for the connection to the server to be established..."} />
}

export default Game