import React from "react"
import Game from "@/pages/Game"
import HowToPlay from "@/pages/HowToPlay"
import Leaderboard from "@/pages/Leaderboard"
import About from "@/pages/About"
import Home from "@/pages/Home"
import NotFoundPage from "@/pages/404"

export type Route = {
    path: string
    element: React.JSX.Element
    name: string
    noTopBar?: boolean
}

export const routes: Route[] = [
    {
        path: "/",
        element: <Home></Home>,
        name: "Home",
        noTopBar: true
    },
    {
        path: "/game",
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
    },
    {
        path: "/about",
        element: <About></About>,
        name: "About"
    },
    {
        path: "/*",
        element: <NotFoundPage></NotFoundPage>,
        name: "404",
        noTopBar: true
    }
]