import React from "react"
import Game from "@/pages/Game"
import HowToPlay from "@/pages/HowToPlay"
import Leaderboard from "@/pages/Leaderboard"

export type Route = {
    path: string
    element: React.JSX.Element
    name: string
}

export const routes: Route[] = [
    {
        path: "/",
        element: <Game></Game>,
        name: "Game"
    },
    {
        path: "/how-to-play",
        element: <HowToPlay></HowToPlay>,
        name: "How to Play"
    },
    {
        path: "/leaderboard",
        element: <Leaderboard></Leaderboard>,
        name: "Leaderboard"
    }
]