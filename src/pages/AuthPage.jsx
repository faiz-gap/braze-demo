import React, { useState, useContext } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { AuthContext } from '../App'; // Import AuthContext

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { login } = useContext(AuthContext); // Use login from context

  const handleLoginSuccess = () => {
    login(); // Update auth state
    // Navigation will be handled by LoginForm or App.jsx based on isAuthenticated
  };

  const handleRegisterSuccess = (email) => {
    setActiveTab('login');
    // Optionally pass 'email' to LoginForm to pre-fill
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 px-6 text-center font-semibold text-base transition-colors focus:outline-none
              ${activeTab === 'login' ? 'text-gray-800 bg-white border-b-2 border-brand-lime' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-semibold text-base transition-colors focus:outline-none
              ${activeTab === 'register' ? 'text-gray-800 bg-white border-b-2 border-brand-lime' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('register')}
          >
            Create Account
          </button>
        </div>

        <div className="p-8 sm:p-10">
          {activeTab === 'login' && <LoginForm onSuccess={handleLoginSuccess} switchToRegister={() => setActiveTab('register')} />}
          {activeTab === 'register' && <RegisterForm onSuccess={handleRegisterSuccess} switchToLogin={() => setActiveTab('login')} />}
        </div>
      </div>
      {/* Debug Panel can be a separate component if needed */}
    </div>
  );
};

export default AuthPage;