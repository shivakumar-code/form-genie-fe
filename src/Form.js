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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import axios from "axios";
import Tesseract from "tesseract.js";

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    idNumber: '',
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
  // const [idImage, setIdImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [idType, setIdType] = useState('');
  // const [inputMethod, setInputMethod] = useState('manual');
  const [isUpload, setIsUpload] = useState(false);
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [otpStage, setOtpStage] = useState('send'); // 'send' or 'verify'

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate form fields
  const validate = () => {
    const newErrors = {};
    if (!formData.idNumber) newErrors.idNumber = 'ID Number is required';
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

  // Handle file upload and OCR
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(
        uploadedFile,
        'eng',
        { logger: m => {} }
      );
      setExtractText(text);
      // Extract ID Number from OCR text (simple example)
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      let idNumber = '';
      // Example: Find a line with 9 digits followed by 4GBR
      const idLine = lines.find(line => /\d{9}4GBR/.test(line));
      if (idLine) {
        idNumber = idLine.substring(0, 9);
      } else {
        // fallback: first line with 9+ digits
        const fallback = lines.find(line => /\d{9,}/.test(line));
        if (fallback) idNumber = fallback.match(/\d{9,}/)[0];
      }
      setFormData(prev => ({
        ...prev,
        idNumber: idNumber || ''
      }));
    } catch (err) {
      alert("OCR failed. Try another image.");
    }
    setProcessing(false);
  };

 const verifyTofetchOTP = async () => {
    debugger;
    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", {
        cardNumber: extractedText || 'CARD123456',
        // email: formData.email,
        // phone: '456'
      });
      setOpenOtpDialog(true);
      setOtpSent(true);
      setOtpStage('verify');
      alert("OTP sent via email & SMS");
    } catch (err) {
      alert("Error sending OTP");
    }
  };

  // Fetch details based on ID Number
  // const handleFetchDetails = async () => {
  //   if (!formData.idNumber) {
  //     alert("Please provide an ID Number.");
  //     return;
  //   }
  //   try {
  //     // const response = await axios.get(`/api/user/${formData.idNumber}`);
  //     // setFormData({ ...formData, ...response.data });
  //     // For demo, just fill some mock data:
  //     setFormData(prev => ({
  //       ...prev,
  //       firstName: 'John',
  //       lastName: 'Doe',
  //       dob: '1990-01-01',
  //       country: 'United Kingdom',
  //       city: 'London',
  //       state: 'Greater London'
  //     }));
  //     setOpenOtpDialog(true); // Show OTP dialog as popup
  //   } catch (err) {
  //     alert("Failed to fetch details.");
  //   }
  // };

  // OTP submit
  // OTP submit (Send OTP)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", {
        cardNumber: formData.idNumber || '123',
        email: formData.email,
        phone: formData.phone
      });
      setOtpSent(true);
      setOtpStage('verify'); // Move to verify stage
      alert("OTP sent via email & SMS");
    } catch (err) {
      alert("Error sending OTP");
    }
  };
  // OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    try {
      // Replace with your OTP verification API
      await axios.post("http://localhost:5000/api/auth/verify-otp-fetch-data", { //http://localhost:5000/api/auth/send-otp
        cardNumber: formData.idNumber || '123',
        otp
      });
      alert("OTP Verified! Form submitted.");
      setOpenOtpDialog(false);
      setOtpStage('send');
      setOtp('');
      setOtpSent(false);
    } catch (err) {
      alert("Invalid OTP");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", {
        citizenId: formData.idNumber || '123',
        email: formData.email,
        // phone: formData.phone
      });
      setOtpSent(true);
      alert("OTP sent via email & SMS");
    } catch (err) {
      alert("Error sending OTP");
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
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
            {/* ID Type Selection */}
            <FormControl fullWidth>
              <InputLabel id="id-type-label">Select ID Type</InputLabel>
              <Select
                labelId="id-type-label"
                label="Select ID Type"
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
              >
                <MenuItem value="driving">Driving Licence</MenuItem>
                <MenuItem value="national">National Card</MenuItem>
                <MenuItem value="passport">Passport</MenuItem>
              </Select>
            </FormControl>

            <FormControl component="fieldset">
              <RadioGroup
                row
                value={isUpload ? "upload" : "manual"}
                onChange={(e) => setIsUpload(e.target.value === "upload")}
              >
                <FormControlLabel value="upload" control={<Radio />} label="Upload Image" />
              </RadioGroup>
            </FormControl>

            {/* Conditional Rendering */}
            {isUpload ? (
              <>
                <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                  {processing ? "Processing..." : "Upload Image"}
                  <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                </Button>
                {file && (
                  <Typography variant="body2" color="text.secondary">
                    {file.name}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    label="ID Number"
                    name="idNumber"
                    value={formData.idNumber}
                    disabled
                    sx={{ flexGrow: 1 }}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={verifyTofetchOTP}
                    disabled={!formData.idNumber}
                  >
                    Fetch Data
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="ID Number"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  error={!!errors.idNumber}
                  helperText={errors.idNumber}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={verifyTofetchOTP}
                  disabled={!formData.idNumber}
                >
                  Fetch Details
                </Button>
              </Box>
            )}
 {/* OTP Dialog */}
            <Dialog open={openOtpDialog} onClose={() => { setOpenOtpDialog(false); setOtpStage('send'); setOtpSent(false); setOtp(''); }}>
              <DialogTitle>OTP Authentication</DialogTitle>
              <DialogContent>
                {otpSent && otpStage === 'send' && (
                  <>
                    <TextField
                      label="Email ID"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleSendOtp}
                      disabled={!formData.email}
                      sx={{ mb: 2 }}
                    >
                      Send OTP
                    </Button>
                  </>
                )}
                {otpStage === 'verify' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                      label="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleVerifyOtp}
                      disabled={!otp}
                    >
                      Verify OTP
                    </Button>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenOtpDialog(false); setOtpStage('send'); setOtpSent(false); setOtp(''); }}>Close</Button>
              </DialogActions>
            </Dialog>


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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ApplicationForm;
