import { Box, Typography } from '@mui/material'

const NotFoundPage = () => {
    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h1" sx={{ fontSize: '10rem' }}>404</Typography>
            <Typography variant="h3">Page Not Found</Typography>
        </Box>
    )
}

export default NotFoundPage