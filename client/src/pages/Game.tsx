import { useState, useEffect } from "react"
import Client from "@/client/client"
import Lobby from "@/components/Lobby"
import Loading from "@/components/Loading"

const Game = () => {
    const [connectionEstablished, setConnectionEstablished] = useState(false)
    useEffect(() => {
        Client.instance.connect().assureConnected().then(() => {
            setConnectionEstablished(true)
        })
        return () => Client.instance.disconnect()
    }, [])
    return connectionEstablished
    ? <Lobby />
    : <Loading message="Waiting for connection to server to be established..." />
}

export default Game