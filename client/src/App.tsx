import { BrowserRouter, Routes, Route } from "react-router-dom"
import TopBar from "@/components/TopBar"
import { routes } from "@/router/router"
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material"

/**
 * dark theme
 */
const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#2c2f33"
        },
        secondary: {
            main: "#7289da"
        },
        background: {
            default: "#23272a"
        }
    }
})

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <TopBar routes={routes}></TopBar>
                <Routes>
                    {routes.map((route) =>
                        <Route key={route.path} path={route.path} element={route.element}></Route>
                    )}
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App