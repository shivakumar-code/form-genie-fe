import React, { useState } from 'react';
import axios from 'axios';

const OtpForm = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

  const handleSendOtp = async () => {
    try {
      const response = await axios.post('http://localhost:5000/send-otp', {
        email,
        phone,
      });
      setStep(2);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post('http://localhost:5000/verify-otp', {
        otp,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      {step === 1 ? (
        <>
          <h2>Enter Email & Phone</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ margin: '8px', padding: '8px', width: '100%' }}
          />
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{ margin: '8px', padding: '8px', width: '100%' }}
          />
          <button onClick={handleSendOtp}>Send OTP</button>
        </>
      ) : (
        <>
          <h2>Enter OTP</h2>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            style={{ margin: '8px', padding: '8px', width: '100%' }}
          />
          <button onClick={handleVerifyOtp}>Verify OTP</button>
        </>
      )}
      <p style={{ marginTop: '16px', color: 'blue' }}>{message}</p>
    </div>
  );
};

export default OtpForm;
