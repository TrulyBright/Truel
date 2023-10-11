import { Box, CircularProgress, Typography } from "@mui/material"

const Loading = (props: {message: string}) => {
    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        }}>
            <CircularProgress />
            <Typography>{props.message}</Typography>
        </Box>
    )
}

export default Loading