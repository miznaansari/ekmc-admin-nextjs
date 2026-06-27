/* eslint-disable react/prop-types */
import { CircularProgress } from '@mui/material'

const Spinner = ({size ,thickness , color ,marginRight }) => {
  return (
    <CircularProgress style={{ color:color ? color  : '#F54F3C' , marginLeft: marginRight ? marginRight : ""}} size={size} thickness={thickness}/>
  )
}

export default Spinner
