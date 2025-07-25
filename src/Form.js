import React, { useState, useRef, useCallback } from 'react';
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
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    idNumber: '', firstName: '', lastName: '', dob: '',
    email: '', phone: '', address1: '', address2: '',
    city: '', state: '', postalCode: '', country: '',
  });
  const [extractedText, setExtractText] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [idType, setIdType] = useState('');
  const [isUpload, setIsUpload] = useState(false);
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [otpStage, setOtpStage] = useState('send');
  const [message, setMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const webCamRef = useRef(null);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setImgSrc(null);
  };

  const capture = useCallback(() => {
    const imageSrc = webCamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webCamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    const { idNumber, firstName, lastName, dob, email, phone, address1, city, state, postalCode, country } = formData;

    if (!idNumber) newErrors.idNumber = 'ID Number is required';
    if (!firstName) newErrors.firstName = 'First Name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!dob) newErrors.dob = 'Date of Birth is required';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Valid email is required';
    if (!phone || !/^\d{10}$/.test(phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!address1) newErrors.address1 = 'Address Line 1 is required';
    if (!city) newErrors.city = 'City is required';
    if (!state) newErrors.state = 'State/Province is required';
    if (!postalCode) newErrors.postalCode = 'Postal Code is required';
    if (!country) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(uploadedFile, 'eng');
      setExtractText(text);
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const idLine = lines.find(line => /\d{9}4GBR/.test(line));
      const fallback = lines.find(line => /\d{9,}/.test(line));
      const idNumber = idLine ? idLine.substring(0, 9) : fallback?.match(/\d{9,}/)?.[0] || '';
      setFormData(prev => ({ ...prev, idNumber }));
    } catch {
      alert("OCR failed. Try another image.");
    } finally {
      setProcessing(false);
    }
  };

  const verifyTofetchOTP = async () => {
    try {
      const response = await axios.post("https://form-genie-be-475414324273.europe-west1.run.app/api/auth/send-otp", {
        cardNumber: formData.idNumber,
        imgSrc
      });
      setOpenOtpDialog(true);
      setOtpSent(true);
      setOtpStage('send');
      setData(response.data.userData);
      // setMessage(response.data.message);
    } catch (error) {
      setMessage('Failed to send OTP');
    }
  }

const handleVerifyOtp = async (e) => {
  e.preventDefault();
  try {
    await axios.post("https://form-genie-be-475414324273.europe-west1.run.app/api/auth/verify-otp", {
      cardNumber: extractedText ? extractedText : formData.idNumber,
      otp
    },
     {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      } 
  );
    alert("OTP Verified!");
    setOpenOtpDialog(false);
    setOtpStage('send');
    setOtp('');
    setOtpSent(false);
    setFormData(prev => ({ ...prev, ...data }));
  } catch (error) {
    setMessage(error.response?.data?.message || 'OTP verification failed');
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  try {
    await axios.post("https://form-genie-be-475414324273.europe-west1.run.app/api/auth/send-otp", {
      citizenId: formData.idNumber,
      email: formData.email,
    },
    {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      } 
  );
    setOtpSent(true);
    alert("OTP sent via email & SMS");
  } catch {
    alert("Error sending OTP");
  }
};

return (
  <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 5, px: 2 }}>
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

          {/* Face scan*/}
          <div>
            <button
              onClick={openModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Scan Face
            </button>

            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-6 w-[90%] max-w-lg shadow-lg relative">
                  <h2 className="text-xl font-semibold mb-4">Face Scanner</h2>

                  <div className="flex flex-col items-center space-y-4">
                    {imgSrc ? (
                      <>
                        <img src={imgSrc} alt="Captured face" width={200} className="rounded shadow" />
                        <button
                          onClick={retake}
                          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Retake Photo
                        </button>
                      </>
                    ) : (
                      <>
                        <Webcam
                          height={300}
                          width={300}
                          ref={webCamRef}
                          screenshotFormat="image/jpeg"
                        />
                        <button
                          onClick={capture}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Capture Photo
                        </button>
                      </>
                    )}
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mt-4"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                Fetch Data
              </Button>
            </Box>
          )}
          {/* OTP Dialog */}
          <Dialog open={openOtpDialog} onClose={() => { setOpenOtpDialog(false); setOtpStage('send'); setOtpSent(false); setOtp(''); }}>
            <DialogTitle>OTP SENT TO YOUR REGISTERED EMAIL ID</DialogTitle>
            <DialogContent>
              {otpSent && otpStage === 'send' && (
                <>
                  <TextField
                    label="OTP"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleVerifyOtp}
                    // disabled={!formData.email}
                    sx={{ mb: 2 }}
                  >
                    Verify OTP
                  </Button>
                  <p style={{ marginTop: '16px', color: 'blue' }}>{message}</p>
                </>
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
