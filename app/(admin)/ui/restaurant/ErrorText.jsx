/* eslint-disable react/prop-types */
import { Typography } from '@mui/material'

const ErrorText = ({value,sx}) => {
  return (
    <Typography fontWeight="500" fontSize="16px" color={'red'} sx={sx}>
        {value}
    </Typography>
  )
}

export default ErrorText
