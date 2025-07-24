// OtpInput.js
import React, { useRef } from 'react';
import { Box, TextField } from '@mui/material';

const OtpInput = ({ value, onChange, length = 6 }) => {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^[0-9]?$/.test(val)) return;

    const otpArray = value.split('');
    otpArray[index] = val;
    const newOtp = otpArray.join('');
    onChange(newOtp);

    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      const otpArray = value.split('');
      otpArray[index - 1] = '';
      onChange(otpArray.join(''));
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <Box display="flex" justifyContent="center" gap={1}>
      {Array.from({ length }).map((_, i) => (
        <TextField
          key={i}
          inputRef={(el) => (inputsRef.current[i] = el)}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          inputProps={{
            maxLength: 1,
            style: {
              textAlign: 'center',
              fontSize: '20px',
              width: '40px',
              height: '40px',
              padding: 0,
            },
          }}
        />
      ))}
    </Box>
  );
};

export default OtpInput;
