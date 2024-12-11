import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { motion, AnimatePresence } from 'framer-motion';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password';

export function AuthPage() {
  const [view, setView] = useState<AuthView>('login');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the reset password route
  React.useEffect(() => {
    if (location.pathname === '/auth/reset-password') {
      setView('reset-password');
    }
  }, [location]);

  const handleSuccess = () => {
    navigate('/');
  };

  const renderForm = () => {
    switch (view) {
      case 'signup':
        return (
          <SignUpForm
            onSuccess={handleSuccess}
            onLoginClick={() => setView('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm onBackToLogin={() => setView('login')} />
        );
      case 'reset-password':
        return <ResetPasswordForm />;
      default:
        return (
          <LoginForm
            onSuccess={handleSuccess}
            onSignUpClick={() => setView('signup')}
            onForgotPasswordClick={() => setView('forgot-password')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderForm()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}