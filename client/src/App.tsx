import { BrowserRouter, Routes, Route } from "react-router-dom"
import TopBar from "@/components/TopBar"
import { routes } from "@/router/router"

const App = () => {
    return (
        <BrowserRouter>
            <TopBar routes={routes}></TopBar>
            <Routes>
                {routes.map((route) =>
                    <Route key={route.path} path={route.path} element={route.element}></Route>
                )}
            </Routes>
        </BrowserRouter>
    )
}

export default App