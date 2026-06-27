import React, { useState } from 'react';
import { TextField, CircularProgress, Chip, Box, IconButton } from '@mui/material';
import { Autocomplete } from '@mui/material';
import { Controller } from 'react-hook-form';
import CloseIcon from '@mui/icons-material/Close';
 
const CustomDropdown = ({
  name,
  control,
  options,
  label = "Select Option",
  loading = false,
  value = null,
  onChange,
  multiple = false,
  width = "100%", // Can be set to a specific pixel value like '400px'
}) => {
  // State to control whether the dropdown is open
  const [open, setOpen] = useState(false);

  // Helper function to find selected option(s)
  const getSelectedOptions = (currentValue) => {
    if (!currentValue) return multiple ? [] : null;
    
    if (multiple) {
      // Handle array of values for multi-select
      if (Array.isArray(currentValue)) {
        return currentValue.map(val => {
          if (typeof val === 'object') {
            // First try to find a match in options
            const matchingOption = options.find(opt => 
              opt.value === val.value || 
              opt.label === val.label
            );
            
            // If we found a match, return it, otherwise use the value as is
            return matchingOption || val;
          }
          
          // If val is not an object, try to find a matching option
          const matchingOption = options.find(opt => 
            opt.value === val || 
            opt.label === val
          );
          
          return matchingOption || { value: val, label: String(val) };
        });
      }
      return [];
    } else {
      // Single select logic
      if (typeof currentValue === 'object') {
        return options.find(opt => 
          opt.value === currentValue.value || 
          opt.label === currentValue.label
        ) || currentValue;
      }
      return options.find(opt => 
        opt.value === currentValue || 
        opt.label === currentValue
      ) || null;
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        // Use the passed value prop or the form field value
        const selectedValue = value !== null ? value : field.value;
        
        return (
          <Box sx={{ 
            position: 'relative', 
            width: width,
            maxWidth: width
          }}>
            <Autocomplete
              multiple={multiple}
              options={options}
              value={getSelectedOptions(selectedValue)}
              getOptionLabel={(option) => option.label || String(option)}
              open={open}
              disableClearable
              onOpen={() => setOpen(true)}
              onClose={(event, reason) => {
                if (!multiple || reason === 'escape' || reason === 'toggleInput') {
                  setOpen(false);
                }
              }}
              isOptionEqualToValue={(option, val) => {
                if (val && typeof val === 'object') {
                  return option.value === val.value || option.label === val.label;
                }
                return option.value === val || option.label === val;
              }}
              onChange={(event, selectedOption) => {
                let valueToSend;

                if (multiple) {
                  valueToSend = selectedOption.map(opt => ({
                    value: opt.value,
                    label: opt.label
                  }));
                } else {
                  valueToSend = selectedOption
                    ? { value: selectedOption.value, label: selectedOption.label }
                    : null;
                  setOpen(false);
                }

                field.onChange(valueToSend);

                if (onChange) {
                  onChange(valueToSend);
                }
              }}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  variant="outlined"
                  sx={{ width: '100%' }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 1,
                        }}
                      >
                        {loading ? <CircularProgress color="inherit" size={23} /> : null}
                        {params.InputProps.endAdornment}
                      </Box>
                    ),
                  }}
                />
              )}
            />
          </Box>
        );
      }}
    />
  );
};

export default CustomDropdown;