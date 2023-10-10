import client from "@/client/client"
import Lobby from "@/components/Lobby"

const Game = () => {
    client.connect()
    return (
        <Lobby></Lobby>
    )
}

export default Game