/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import styled from 'styled-components';

const CustomRadio = styled(Radio)(({ theme }) => ({

    '&.Mui-checked':{
    color: '#00CF63 !important',     //Internal Circle Color
    
},

'&.Mui-checked .MuiIconButton-root': {
  '&:before': {
    content: '""',
    display: 'block',
    width: '10%',
    height: '10%',
    color: 'white', // Change the color of the dot
    borderRadius: '50%', // Make the dot round
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }
},
    
  }));
export default function RadioField( props) {

  const {value,label,arr,onChange} = props;
  //console.log("value" , value)
  return (
    <FormControl>
      
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="female"
        name="radio-buttons-group"
        sx={{flexDirection:'row'}}
        onChange={onChange}
        value={value}
        
      >
      {
        arr.map((item, index)=> <FormControlLabel key={index} value={item.value} control={<Radio  color="secondary" />} label={item.label}/>)
      }
      </RadioGroup>
    </FormControl>
  );
}