import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import authService from '../services/auth';

const Register = () => {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    whatsapp: '',
    year: 'FE',
    branch: 'Computer',
    pictIdCard: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Registration, 2: OTP Verification
  const [otpData, setOtpData] = useState({
    email: '',
    otp: ''
  });

  const years = ['FE', 'SE', 'TE', 'BE'];
  const branches = ['Computer', 'IT', 'E&TC', 'AIDS', 'ECE'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePictId = (pictId) => {
    const pictIdRegex = /^PICT-(CS|IT|ETC|MECH|CIVIL)-20[0-9]{2}-[0-9]{3}$/;
    return pictIdRegex.test(pictId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!validatePictId(formData.pictIdCard)) {
      setError('Please enter a valid PICT ID card number (e.g., PICT-CS-2023-001)');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register(registerData);
      
      if (response.otpSent) {
        setOtpData({ email: formData.email, otp: '' });
        setStep(2);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyEmail(otpData);
      
      if (response.token) {
        // Update auth context with token and user data
        await loginWithToken(response.token, response.user);
        
        // Navigate to home page
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.resendOTP(otpData.email);
      setError('');
      alert('OTP sent successfully! Please check your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">
                {step === 1 ? 'Register' : 'Verify Email'}
              </h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="10 digit number"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="whatsapp" className="form-label">WhatsApp</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      placeholder="10 digit number"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="year" className="form-label">Year</label>
                    <select
                      className="form-select"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="branch" className="form-label">Branch</label>
                    <select
                      className="form-select"
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      required
                    >
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="pictIdCard" className="form-label">PICT ID Card Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="pictIdCard"
                    name="pictIdCard"
                    value={formData.pictIdCard}
                    onChange={handleChange}
                    required
                    placeholder="PICT123456"
                    pattern="PICT[0-9]{6}"
                    title="Enter PICT ID in format: PICT123456"
                  />
                  <div className="form-text">
                    Enter your PICT identity card number (e.g., PICT123456)
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
                </form>
              ) : (
                <form onSubmit={handleOTPSubmit}>
                  <div className="alert alert-info" role="alert">
                    <h5 className="alert-heading">Check Your Email!</h5>
                    <p className="mb-0">
                      We've sent a 6-digit verification code to <strong>{otpData.email}</strong>
                    </p>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label">Enter Verification Code</label>
                    <input
                      type="text"
                      className="form-control text-center"
                      id="otp"
                      name="otp"
                      value={otpData.otp}
                      onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                      required
                      placeholder="123456"
                      maxLength="6"
                      style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 mb-2"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() => setStep(1)}
                    >
                      ← Back to Registration
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center mt-3">
                <p className="mb-0">
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
