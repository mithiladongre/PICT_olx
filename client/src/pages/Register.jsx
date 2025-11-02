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
    branch: 'CS',
    pictIdCard: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [otpData, setOtpData] = useState({
    email: '',
    otp: ''
  });

  const years = ['FE', 'SE', 'TE', 'BE'];
  const branches = ['CS', 'IT', 'ENTC', 'AIDS', 'ECE'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Correct PICT Registration ID Validation
  const validatePictId = (pictId) => {
    const pictIdRegex = /^(C2K|I2K|E2K|A2K|EC2K)[0-9]{2}[0-9]{4}$/;
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
      setError('Invalid PICT Registration ID. Example: C2K22XXXX / I2K22XXXX');
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
        await loginWithToken(response.token, response.user);
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
              
              {error && <div className="alert alert-danger">{error}</div>}

              {step === 1 ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" name="name"
                        value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" name="email"
                        value={formData.email} onChange={handleChange}
                        placeholder="your.email@pict.edu" required />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input type="tel" className="form-control" name="phone"
                        value={formData.phone} onChange={handleChange}
                        placeholder="10 digit number" required />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">WhatsApp</label>
                      <input type="tel" className="form-control" name="whatsapp"
                        value={formData.whatsapp} onChange={handleChange}
                        placeholder="10 digit number" required />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Year</label>
                      <select className="form-select" name="year"
                        value={formData.year} onChange={handleChange} required>
                        {years.map(y => <option key={y}>{y}</option>)}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Branch</label>
                      <select className="form-select" name="branch"
                        value={formData.branch} onChange={handleChange} required>
                        {branches.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">PICT Registration Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pictIdCard"
                      value={formData.pictIdCard}
                      onChange={handleChange}
                      required
                      placeholder="C2K22XXXX / I2K22XXXX"
                      pattern="(C2K|I2K|E2K|A2K|EC2K)[0-9]{2}[0-9]{4}"
                      title="Format: C2K22XXXX (branch code + year + roll)"
                    />
                    <div className="form-text">
                      CS = C2K | IT = I2K | ENTC = E2K | AIDS = A2K | ECE = EC2K
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control"
                        name="password" value={formData.password}
                        onChange={handleChange} required minLength="6" />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input type="password" className="form-control"
                        name="confirmPassword" value={formData.confirmPassword}
                        onChange={handleChange} required />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Register'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOTPSubmit}>
                  <div className="alert alert-info">
                    OTP sent to <strong>{otpData.email}</strong>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Enter OTP</label>
                    <input type="text" className="form-control text-center"
                      name="otp" value={otpData.otp}
                      onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                      required maxLength="6" placeholder="123456"
                      style={{ fontSize: '1.4rem', letterSpacing: '6px' }} />
                  </div>

                  <button className="btn btn-success w-100 mb-2" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>

                  <button type="button" className="btn btn-outline-secondary w-100"
                    onClick={handleResendOTP} disabled={loading}>
                    Resend OTP
                  </button>

                  <div className="text-center mt-3">
                    <button className="btn btn-link" onClick={() => setStep(1)}>
                      ← Back to Registration
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center mt-3">
                Already have an account? <Link to="/login">Login here</Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
