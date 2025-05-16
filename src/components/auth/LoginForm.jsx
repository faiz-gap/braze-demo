import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import BrazeService from '../../services/braze-service';
import { AuthContext } from '../../App';


const API_URL = '/api';

const LoginForm = ({ onSuccess, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: contextLogin } = useContext(AuthContext);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const fetchResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: password })
      });
      const data = await fetchResponse.json();

      if (fetchResponse.ok && data.success) {
        const authData = data.data;
        Object.entries(authData).forEach(([key, value]) => localStorage.setItem(String(key), String(value)));
        localStorage.setItem('userEmail', email);
        if (authData.firstname) localStorage.setItem('userFirstName', authData.firstname);
        if (authData.lastname) localStorage.setItem('userLastName', authData.lastname);

        const actorId = authData.actor_id;
        if (actorId) {
          localStorage.setItem('actor_id', actorId);
          if (BrazeService.isInitialized) {
            const brazeUserAttributes = {
              email: email,
              firstName: localStorage.getItem('userFirstName') || (authData.firstname || null),
              lastName: localStorage.getItem('userLastName') || (authData.lastname || null)
            };
            Object.keys(brazeUserAttributes).forEach(key => brazeUserAttributes[key] == null && delete brazeUserAttributes[key]);
            BrazeService.changeUser(actorId, brazeUserAttributes);
            BrazeService.logCustomEvent('user_logged_in');
          }
        }
        setSuccessMsg('Login successful! Redirecting...');
        contextLogin(); // Update auth context
        setTimeout(() => {
          onSuccess(); // Call parent success handler
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(data.error || data.message || 'Login failed. Please check your credentials.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">Welcome Back</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded-md text-sm">{error}</div>}
      {successMsg && <div className="p-3 bg-green-100 text-green-700 border border-green-200 rounded-md text-sm">{successMsg}</div>}
      <div>
        <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input type="email" id="loginEmail" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-auth" />
      </div>
      <div>
        <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <input type="password" id="loginPassword" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-auth" />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-[#7fff8a] to-[#b8ff5b] text-gray-800 font-semibold rounded-full shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      <div className="text-center text-sm text-gray-500 mt-8 space-y-1">
        <p><a href="#" onClick={(e) => { e.preventDefault(); alert('Forgot password functionality not implemented yet'); }} className="text-gray-400 hover:text-gray-600 underline">Forgot password?</a></p>
        <p>New user? <a href="#" onClick={(e) => { e.preventDefault(); switchToRegister(); }} className="text-gray-400 hover:text-gray-600 underline">Create an account</a></p>
      </div>
    </form>
  );
};

export default LoginForm;