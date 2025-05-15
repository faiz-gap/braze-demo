import React, { useState } from 'react';
import BrazeService from '../../services/braze-service';

const API_URL = '/api';

const checkPasswordStrengthUtil = (password) => {
    // ... (same as your original JS)
    if (password.length === 0) return { className: '', text: '', width: 'w-0' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    else if (/[a-zA-Z]/.test(password)) score += 0.5;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 2) return { className: 'bg-red-500', text: 'Weak', width: 'w-1/3' };
    if (score < 3.5) return { className: 'bg-yellow-500', text: 'Medium', width: 'w-2/3' };
    return { className: 'bg-green-500', text: 'Strong', width: 'w-full' };
};


const RegisterForm = ({ onSuccess, switchToLogin }) => {
  const [formData, setFormData] = useState({
    firstname: '', lastname: '', email: '', password: '', confirmPassword: '', phoneCode: '', phone: '',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ className: '', text: '', width: 'w-0' });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrengthUtil(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        email: formData.email, firstname: formData.firstname, lastname: formData.lastname,
        password: formData.password, username: formData.email, // Upmind uses username for login
        phone: formData.phone || null, phone_code: formData.phoneCode || null,
        phone_country_code: null, // Or derive from phone_code if possible
      };
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('userEmail', formData.email); // Store for potential pre-fill
        localStorage.setItem('userFirstName', formData.firstname);
        localStorage.setItem('userLastName', formData.lastname);

        if (BrazeService.isInitialized) {
          BrazeService.logCustomEvent('user_registered', { registration_method: 'form_submission' });
        }
        setSuccessMsg('Account created successfully! Please login.');
        setFormData({ firstname: '', lastname: '', email: '', password: '', confirmPassword: '', phoneCode: '', phone: ''});
        setPasswordStrength({ className: '', text: '', width: 'w-0' });
        setTimeout(() => {
          onSuccess(formData.email); // Pass email to prefill login
        }, 2000);
      } else {
        setError(data.error || data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">Create Account</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded-md text-sm">{error}</div>}
      {successMsg && <div className="p-3 bg-green-100 text-green-700 border border-green-200 rounded-md text-sm">{successMsg}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
          <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} required className="input-auth" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
          <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} required className="input-auth" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-auth" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input-auth" />
        <div className={`strength-indicator-base ${passwordStrength.width} ${passwordStrength.className}`}></div>
        <p className="text-xs text-gray-500 mt-1">Use at least 8 characters with letters and numbers. {passwordStrength.text && <span className={`font-medium ${passwordStrength.className.includes('red') ? 'text-red-500' : passwordStrength.className.includes('yellow') ? 'text-yellow-600' : 'text-green-600'}`}>{passwordStrength.text}</span>}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="input-auth" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
        <div className="flex gap-2.5">
          <input type="text" name="phoneCode" placeholder="+1" value={formData.phoneCode} onChange={handleChange} className="input-auth w-24" />
          <input type="tel" name="phone" placeholder="123-456-7890" value={formData.phone} onChange={handleChange} className="input-auth flex-1" />
        </div>
      </div>
      <button type="submit" disabled={isLoading} className="w-full py-3.5 px-4 bg-gradient-to-r from-[#7fff8a] to-[#b8ff5b] text-gray-800 font-semibold rounded-full shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 text-lg">
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); switchToLogin(); }} className="text-gray-400 hover:text-gray-600 underline">Sign in</a></p>
      </div>
    </form>
  );
};

export default RegisterForm;