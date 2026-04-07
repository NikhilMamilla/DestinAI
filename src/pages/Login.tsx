import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
      showToast('Email loaded from saved preference', 'info');
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      showToast('Login successful! Welcome back ✓', 'success');
      setTimeout(() => navigate('/home'), 1500);
    } catch (error: any) {
      console.error('Login Error:', error);
      let errorMessage = 'Login failed. Please check your network and try again.';
      
      // Perfect Firebase Error Mapping
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Incorrect email or password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled by an administrator.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please wait or reset your password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast('Login successful with Google! ✓', 'success');
      setTimeout(() => navigate('/home'), 1500);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      let errorMessage = 'Google Sign-In failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. Google popup was closed.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email but different login method.';
      } else if (error.code === 'auth/network-request-failed') {
         errorMessage = 'Network error. Please check your internet connection.';
      }

      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight flex justify-center items-center p-6 relative overflow-hidden font-body text-mist-500">
      
      {/* Abstract Backgrounds */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-atlas rounded-full blur-[150px] opacity-30 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-aurora-800 rounded-full blur-[120px] opacity-10 -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Brand Logo Corner */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 font-display text-2xl font-bold tracking-widest uppercase text-white cursor-pointer hover:opacity-80 transition-opacity z-20" onClick={() => navigate('/')}>
        DESTIN<span className="text-gold">AI</span>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 right-8 z-50 p-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-4 bg-[#070F1A] border border-white/10 transition-all duration-300 transform translate-x-0 ${toast.type === 'success' ? 'border-l-4 border-l-gold text-white' : toast.type === 'error' ? 'border-l-4 border-l-red-500 text-white' : 'border-l-4 border-l-aurora-400 text-white'}`}>
          <span className="font-label tracking-widest text-[10px] uppercase">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto opacity-60 hover:opacity-100 hover:text-gold transition-colors text-lg">&times;</button>
        </div>
      )}

      {/* Main Glass Container */}
      <div className="flex w-full max-w-[900px] bg-[#0B1A2E]/60 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 flex-col md:flex-row animate-fade-in-up z-10 relative">
        
        {/* Left Visual Section */}
        <div className="hidden md:flex flex-1 relative border-r border-white/10">
          <img src="/pexels-asadphoto-28408433.jpg" alt="Voyage background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A2E] via-[#0B1A2E]/60 to-transparent"></div>
          
          <div className="absolute inset-0 p-10 flex flex-col justify-end">
             <span className="font-label text-[10px] uppercase text-gold tracking-widest mb-1 block">DestinAI</span>
             <h1 className="font-editorial text-4xl text-white mb-4 leading-tight">Welcome <br/> Back.</h1>
             <p className="font-body text-[13px] text-mist-500/80 leading-relaxed max-w-sm">
               Your next adventure is waiting for you. Log in to access your saved travel plans and secure bookings.
             </p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="flex-1 p-8 md:px-12 md:py-6 flex flex-col justify-center relative">
          <div className="mb-6">
            <h2 className="font-display text-2xl text-white mb-2 font-bold tracking-wide">Log In</h2>
            <p className="font-label text-xs text-mist-500/50 uppercase tracking-widest">Access your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-label text-mist-500/70 mb-2 uppercase tracking-[0.2em]">Email Address</label>
              <input 
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-xl text-base text-white bg-white/5 border border-white/10 focus:outline-none focus:border-gold focus:bg-white/10 transition-all placeholder:text-mist-500/30 font-body"
              />
            </div>

            <div>
              <label className="block text-[10px] font-label text-mist-500/70 mb-2 uppercase tracking-[0.2em]">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-3 rounded-xl text-base text-white bg-white/5 border border-white/10 focus:outline-none focus:border-gold focus:bg-white/10 transition-all placeholder:text-mist-500/30 font-body pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-mist-500/60 hover:text-gold transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.978 9.978 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-label uppercase tracking-widest mt-1">
              <label className="flex items-center gap-3 cursor-pointer text-mist-500 hover:text-white transition-colors">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 cursor-pointer accent-gold bg-white/10 border-white/20 rounded" 
                />
                <span className="mt-px">Remember me</span>
              </label>
              <a href="#" className="text-gold hover:text-gold-dark transition-colors">Forgot password?</a>
            </div>

            <div className="mt-3">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full px-5 py-3.5 bg-gold text-midnight border-none rounded-xl text-xs font-label uppercase tracking-widest shadow-[0_4px_20px_rgba(255,183,64,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(255,183,64,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
            </div>
          </form>

          <div className="flex items-center my-4 gap-4 opacity-50">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20"></div>
            <div className="text-[10px] text-white font-label tracking-widest uppercase">OR</div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20"></div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white text-midnight border-none rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
               <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <div className="text-center">
            <p className="text-xs text-mist-500/70 font-body">
              Don't have an account? <Link to="/signup" className="text-gold font-bold hover:underline transition-colors uppercase font-label text-[10px] tracking-widest ml-1">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
