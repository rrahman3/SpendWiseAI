
import React, { useState } from 'react';
import { AuthView, UserProfile } from '../types';
import { authService } from '../services/authService';

interface LoginProps {
  onLogin: (userData: UserProfile) => void;
  onBackToHome: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBackToHome }) => {
  const [authView, setAuthView] = useState<AuthView>('sign-in');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const result = await authService.signInWithEmail(email, password);
    setIsLoading(false);
    
    if (result.success && result.user) {
      onLogin(result.user);
    } else {
      setError(result.message);
      if (result.message.includes('verify')) {
        setAuthView('verify-email');
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const result = await authService.signUpWithEmail(name, email, password);
    setIsLoading(false);
    
    if (result.success) {
      setSuccess(result.message);
      setAuthView('verify-email');
    } else {
      setError(result.message);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const result = await authService.verifyEmail(email, verificationCode);
    setIsLoading(false);
    
    if (result.success && result.user) {
      onLogin(result.user);
    } else {
      setError(result.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const result = await authService.forgotPassword(email);
    setIsLoading(false);
    setSuccess(result.message);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const user = await authService.signInWithGoogle();
    setIsLoading(false);
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        <button 
          onClick={onBackToHome}
          className="group flex items-center space-x-2 text-gray-400 hover:text-gray-900 transition-colors mx-auto mb-4"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-xs font-black uppercase tracking-widest">Back to Website</span>
        </button>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-200 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            SpendWise<span className="text-blue-600">AI</span>
          </h1>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {authView === 'sign-in' && 'Welcome Back'}
              {authView === 'sign-up' && 'Create Account'}
              {authView === 'forgot-password' && 'Reset Password'}
              {authView === 'verify-email' && 'Verify Email'}
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              {authView === 'sign-in' && 'Enter your credentials to continue'}
              {authView === 'sign-up' && 'Start your journey to financial clarity'}
              {authView === 'forgot-password' && 'Enter your email to receive a reset link'}
              {authView === 'verify-email' && 'Enter the 6-digit code sent to your inbox'}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold border border-emerald-100 animate-in fade-in slide-in-from-top-2">
              {success}
            </div>
          )}

          {authView === 'sign-in' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="space-y-2">
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => { setAuthView('forgot-password'); clearMessages(); }}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : 'Sign In'}
              </button>
            </form>
          )}

          {authView === 'sign-up' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Full Name"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : 'Create Account'}
              </button>
            </form>
          )}

          {authView === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Registered Email Address"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : 'Send Reset Link'}
              </button>
              <button 
                type="button"
                onClick={() => { setAuthView('sign-in'); clearMessages(); }}
                className="w-full text-[10px] font-black uppercase tracking-widest text-gray-400"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {authView === 'verify-email' && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-black text-gray-900 text-center text-3xl tracking-[0.5em] placeholder:text-gray-200"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  (Check your browser console for the mock code)
                </p>
              </div>
              <button
                type="submit"
                disabled={isLoading || verificationCode.length < 6}
                className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : 'Verify & Log In'}
              </button>
            </form>
          )}

          {(authView === 'sign-in' || authView === 'sign-up') && (
            <>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-[10px] text-gray-300 font-black uppercase tracking-widest">Or social account</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-white border-2 border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 text-gray-700 font-bold rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-70 group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z" />
                  <path fill="#34A853" d="M16.04 18.013c-1.09.693-2.459 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.114C3.198 21.302 7.27 24 12 24c3.055 0 5.777-1.025 7.72-2.772l-3.68-3.215z" />
                  <path fill="#4285F4" d="M23.49 12.275c0-.868-.077-1.705-.218-2.51H12v4.75h6.44c-.278 1.495-1.122 2.76-2.39 3.605l3.68 3.215C21.868 19.455 24 16.145 24 12.275" />
                  <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.795.132-1.559.368-2.268L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.236 5.335l4.041-3.067z" />
                </svg>
                <span className="group-hover:text-blue-600 transition-colors">Continue with Google</span>
              </button>

              <div className="pt-4">
                {authView === 'sign-in' ? (
                  <p className="text-xs text-gray-500 font-medium">
                    New to SpendWise? {' '}
                    <button 
                      onClick={() => { setAuthView('sign-up'); clearMessages(); }}
                      className="text-blue-600 font-black uppercase tracking-widest hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 font-medium">
                    Already have an account? {' '}
                    <button 
                      onClick={() => { setAuthView('sign-in'); clearMessages(); }}
                      className="text-blue-600 font-black uppercase tracking-widest hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        
        <p className="text-[10px] text-gray-400 font-medium px-8 leading-relaxed">
          By continuing, you agree to SpendWise AI's <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Login;
