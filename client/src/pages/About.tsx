import { Box, Typography } from "@mui/material"

const About = () => {
    return (
        <Box sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <Typography variant="h6">Truel</Typography>
            <Typography variant="caption">n. a duel fought between three people</Typography>
        </Box>
    )
}

export default About