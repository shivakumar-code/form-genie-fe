  import React, { useState } from 'react';
  import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Stack,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Divider,
  } from '@mui/material';
  import axios from "axios";
  // import Webcam from "react-webcam";
  import Tesseract from "tesseract.js";

  // const mockAutoFillData = {

  //   idNumber: 'ABC1234567',
  //   firstName: 'Kapil',
  //   lastName: 'Patil',
  //   dob: '1990-01-01',
  //   email: 'Kapil@example.com',
  //   phone: '1234567890',
  //   address1: '123 Main Street',
  //   address2: 'Apt 4B',
  //   city: 'London',
  //   state: 'Greater London',
  //   postalCode: 'W1A 1AA',
  //   country: 'United Kingdom'
  // };
  
  const ApplicationForm = () => {
    const [formData, setFormData] = useState({
      idNumber:'',
      firstName: '',
      lastName: '',
      dob: '',
      email: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    });
    const [extractedText, setExtractText] = useState(null);
    const [idImage, setIdImage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const [errors, setErrors] = useState({});
    const [file, setFile] = useState(null);
    const [idType, setIdType] = useState('');
    const [inputMethod, setInputMethod] = useState('upload');
    const [authStage, setAuthStage] = useState(false);

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
      const newErrors = {};
      if(!formData.idNumber) newErrors.idNumber = 'ID Number is required'
      if (!formData.firstName) newErrors.firstName = 'First Name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.dob) newErrors.dob = 'Date of Birth is required';
      if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))
        newErrors.email = 'Valid email is required';
      if (!formData.phone || !/^\d{10}$/.test(formData.phone))
        newErrors.phone = 'Phone number must be 10 digits';
      if (!formData.address1) newErrors.address1 = 'Address Line 1 is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State/Province is required';
      if (!formData.postalCode) newErrors.postalCode = 'Postal Code is required';
      if (!formData.country) newErrors.country = 'Country is required';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleFileUpload = async(e) => {
      setIdImage(URL.createObjectURL(e.target.files?.[0]));
      // if (uploadedFile) {
      //   setFile(uploadedFile);
      //   handleAutoFill();
      // }
    }
      const handleScanCard = async () => {
        if (!idImage) return;
        setProcessing(true);
        const {
          data: { text },
        } = await Tesseract.recognize(idImage, 'eng');
        setExtractText(text);
        setProcessing(false);
    };
    const handleSubmit = async () => {
      try {
        await axios.post("http://localhost:5000/send-otp", {
          citizenId: extractedText || '123',
          email: formData.email,
          phone: '456'
        });
        setOtpSent(true);
        alert("OTP sent via email & SMS");
      } catch (err) {
        alert("Error sending OTP");
      }
    };

    // const handleSubmit = (e) => {
    //   e.preventDefault();
    //   if (validate()) {
    //     console.log('Form submitted:', formData);
    //     alert('Form submitted successfully!');
    //   }
    // };

    const handleAutoFill = () => {
      // setFormData(text);
      if(!extractedText){
        alert("No text extracted from image.");
        return;
        }
      

      const lines = extractedText.split('\n').map(line=>line.trim()).filter(Boolean);
      let idNumber = '';
      let firstName = '';
      let lastName = '';
      let country = '';
      let dob = '';
      
      const passportLine = lines.find(line => line.startsWith('P<'));
      if (passportLine) {
        const parts = passportLine.split('<<');
        const namePart = parts[0].replace('P<GBR', '');
        lastName = namePart.trim();
      
        const givenNames = parts[1]?.split('<') || [];
        firstName = givenNames[0]?.trim() || '';
      
        idNumber = lines.find(line => /\d{9}4GBR/.test(line))?.substring(0, 9) || '';

        const dobMatch = lines.find(line => /\d{9}4GBR\d{6}/.test(line));
        if (dobMatch) {
          const dobRaw = dobMatch.substring(13, 19); // YYMMDD
          const year = parseInt(dobRaw.substring(0, 2)) + 1900; // Assuming year < 2000
          const month = dobRaw.substring(2, 4);
          const day = dobRaw.substring(4, 6);
          dob = `${year}-${month}-${day}`;
        }
      }
  
    country = 'United Kingdom'; // hardcoded or infer if needed
  
    setFormData({
      ...formData,
      idNumber,
      firstName,
      lastName,
      dob,
      country,
      email: '',
      phone: '',
      address1: '',
      address2: '',
      city: 'London',
      state: 'Greater London',
      postalCode: '',
    });
    setAuthStage(true);
    };
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5', // standard light gray
          py: 5,
          px: 2,
      }}
      >

        <Paper elevation={6} sx={{ maxWidth: 600, mx: 'auto', p: 4, backgroundColor: 'rgba(240, 240, 240)' }}>
          <Typography variant="h5" align="center" gutterBottom color="primary">
            Application & Registration Form
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
            {!authStage ? (
  <>
    {/* ID Type Selection */}
    <FormControl fullWidth>
      <InputLabel id="id-type-label">Select ID Type</InputLabel>
      <Select
        labelId="id-type-label"
        value={idType}
        onChange={(e) => setIdType(e.target.value)}
      >
        <MenuItem value="driving">Driving Licence</MenuItem>
        <MenuItem value="national">National Card</MenuItem>
        <MenuItem value="passport">Passport</MenuItem>
      </Select>
    </FormControl>

    {/* Upload or Manual Radio */}
    <FormControl component="fieldset">
      <RadioGroup
        row
        value={inputMethod}
        onChange={(e) => setInputMethod(e.target.value)}
      >
        <FormControlLabel value="upload" control={<Radio />} label="Upload File" />
        <FormControlLabel value="manual" control={<Radio />} label="Enter ID Number" />
      </RadioGroup>
    </FormControl>

    <Button onClick={handleScanCard} disabled={!idImage || processing}>
      {processing ? "Processing..." : "Scan ID Card/Extract Text"}
    </Button>

    {inputMethod === 'upload' && (
      <>
        <Button variant="outlined" component="label">
          {processing ? "Processing..." : "Upload Image to extract ID"}
          <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
        </Button>
        {file && (
          <Typography variant="body2" color="text.secondary">
            {file.name}
          </Typography>
        )}
      </>
    )}

    {inputMethod === 'manual' && (
      <TextField
        label="Enter ID Number"
        name="idNumber"
        value={formData.idNumber}
        onChange={handleChange}
        error={!!errors.idNumber}
        helperText={errors.idNumber}
        fullWidth
      />
    )}

    <Button variant="outlined" color="secondary" onClick={handleAutoFill}>
      Auto-Fill 
    </Button>
  </>
) : (
  <>
    {/* ✅ OTP Authentication Section */}
    <Typography variant="h6" color="primary">
      OTP Authentication
    </Typography>

    <TextField
      label="Email ID"
      name="email"
      type="email"
      value={formData.email}
      onChange={handleChange}
      error={!!errors.email}
      helperText={errors.email}
      fullWidth
    />

    <TextField
      label="Phone Number"
      name="phone"
      type="tel"
      value={formData.phone}
      onChange={handleChange}
      error={!!errors.phone}
      helperText={errors.phone}
      fullWidth
    />

    <Button
      variant="contained"
      color="secondary"
      onClick={handleSubmit}
      disabled={!formData.email || !formData.phone}
    >
      Send OTP
    </Button>

    {otpSent && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
        <TextField
          label="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
        >
          Submit Form
        </Button>
      </Box>
    )}
  </>
)}


              <Divider sx={{ my: 3, borderBottomWidth: 3, borderColor: 'primary.main' }} />

              <Typography variant="h6" color="primary">
                User Information
              </Typography>

              <TextField
                label="ID Number (Editable)"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                error={!!errors.idNumber}
                helperText={errors.idNumber}
                fullWidth
              />

              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                fullWidth
              />

              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                fullWidth
              />

              <TextField
                label="Date of Birth"
                name="dob"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dob}
                onChange={handleChange}
                error={!!errors.dob}
                helperText={errors.dob}
                fullWidth
              />

              <TextField
                label="Email ID"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
              />

              <TextField
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                fullWidth
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" color="primary">
                Address
              </Typography>

              <TextField
                label="Address Line 1"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                error={!!errors.address1}
                helperText={errors.address1}
                fullWidth
              />

              <TextField
                label="Address Line 2"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={!!errors.city}
                helperText={errors.city}
                fullWidth
              />

              <TextField
                label="State / Province"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={!!errors.state}
                helperText={errors.state}
                fullWidth
              />

              <TextField
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                error={!!errors.postalCode}
                helperText={errors.postalCode}
                fullWidth
              />

              <TextField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                error={!!errors.country}
                helperText={errors.country}
                fullWidth
              />
                {otpSent && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <Button 
                    type="submit" variant="contained" color="primary"
                    onClick={handleSubmit} 
                    disabled={!extractedText || (!formData.email || !formData.phone)}>
                      Submit Form
                    </Button>
                </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button type="submit" variant="contained" color="primary">
                    Submit Form
                  </Button>
                </Box>
            </Stack>
          </form>
        </Paper>
      </Box>
    );
  };

  export default ApplicationForm;
