import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function SignUp() {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  // New Travel Persona State
  const [travelStyle, setTravelStyle] = useState('explorer'); // explorer, backpacker, elite
  const [currency, setCurrency] = useState('USD'); // USD, INR, EUR

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname || !email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (fullname.length < 2) {
      showToast('Full name must be at least 2 characters long', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullname });
      await addDoc(collection(db, 'users'), {
          uid: user.uid,
          fullName: fullname,
          email: email,
          travelStyle,
          currency,
          createdAt: serverTimestamp(),
      });

      showToast('Account created successfully! ✓', 'success');
      setTimeout(() => navigate('/home'), 1500);
    } catch (error: any) {
      console.error('Signup Error:', error);
      let errorMessage = 'Error creating account. Please check your network and try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please log in instead!';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 6 characters.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
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
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Firestore write is independent - auth success must NOT depend on it
      try {
        await addDoc(collection(db, 'users'), {
          uid: user.uid,
          fullName: user.displayName || 'Traveler',
          email: user.email,
          travelStyle: 'explorer',
          currency: 'USD',
          createdAt: serverTimestamp(),
        });
      } catch (firestoreError) {
        // Silently log - user is authenticated regardless of Firestore write
        console.warn('Firestore user profile write failed (non-critical):', firestoreError);
      }

      showToast('Account successfully linked with Google! ✓', 'success');
      setTimeout(() => navigate('/home'), 1500);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      let errorMessage = 'Google Sign-In failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-up cancelled. Google popup was closed.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email but a different login method.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another sign-in popup is already open. Please close it and try again.';
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
      <div className="flex w-full max-w-[900px] bg-[#0B1A2E]/60 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 flex-col md:flex-row-reverse animate-fade-in-up z-10 relative">
        
        {/* Right Visual Section (Flipped for Signup) */}
        <div className="hidden md:flex flex-1 relative border-l border-white/10">
          <img src="/pexels-trung-huynh-30350949-6923292.jpg" alt="Voyage background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A2E] via-[#0B1A2E]/60 to-transparent"></div>
          
          <div className="absolute inset-0 p-10 flex flex-col justify-end">
             <span className="font-label text-[10px] uppercase text-gold tracking-widest mb-1 block">Get Started</span>
             <h1 className="font-editorial text-4xl text-white mb-3 leading-tight">Create <br/> Account.</h1>
             <p className="font-body text-xs text-mist-500/80 leading-relaxed max-w-sm">
               Join tens of thousands of travelers trusting DESTINAI to plan their perfect trips effortlessly.
             </p>
          </div>
        </div>

        {/* Left Form Section */}
        <div className="flex-1 p-8 md:px-12 md:py-6 flex flex-col justify-center relative">
          <div className="mb-6">
            <h2 className="font-display text-2xl text-white mb-2 font-bold tracking-wide">Sign Up</h2>
            <p className="font-label text-xs text-mist-500/50 uppercase tracking-widest">Create your new account</p>
          </div>

          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-label text-mist-500/70 mb-2 uppercase tracking-[0.2em]">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-xl text-base text-white bg-white/5 border border-white/10 focus:outline-none focus:border-gold focus:bg-white/10 transition-all placeholder:text-mist-500/30 font-body"
              />
            </div>

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

            {/* Travel Persona Selection */}
            <div className="mt-2 p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="block text-[10px] font-label text-gold mb-4 uppercase tracking-[0.2em]">Travel Persona</span>
              
              <div className="flex flex-col gap-4">
                {/* Style */}
                <div>
                  <p className="text-[9px] text-white/40 uppercase mb-2 tracking-widest">Your Style</p>
                  <div className="flex gap-2">
                    {[
                      { id: 'backpacker', label: 'Backpacker', color: 'border-teal-400/30' },
                      { id: 'explorer', label: 'Explorer', color: 'border-gold/30' },
                      { id: 'elite', label: 'Elite', color: 'border-coral/30' }
                    ].map(style => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setTravelStyle(style.id)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                          travelStyle === style.id 
                            ? 'bg-white/10 border-white text-white shadow-lg' 
                            : `bg-transparent ${style.color} text-white/40 hover:border-white/50`
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <p className="text-[9px] text-white/40 uppercase mb-2 tracking-widest">Preferred Currency</p>
                  <div className="flex gap-2">
                    {[
                      { id: 'USD', label: 'USD ($)' },
                      { id: 'INR', label: 'INR (₹)' },
                      { id: 'EUR', label: 'EUR (€)' }
                    ].map(curr => (
                      <button
                        key={curr.id}
                        type="button"
                        onClick={() => setCurrency(curr.id)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                          currency === curr.id 
                            ? 'bg-white/10 border-white text-white shadow-lg' 
                            : 'bg-transparent border-white/10 text-white/40 hover:border-white/50'
                        }`}
                      >
                        {curr.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full px-5 py-3.5 bg-gold text-midnight border-none rounded-xl text-[11px] font-label uppercase tracking-widest shadow-[0_4px_20px_rgba(255,183,64,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(255,183,64,0.4)] hover:bg-[#D48500] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Creating...' : 'Create Account'}
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
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white text-midnight border-none rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
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
              Already have an account? <Link to="/login" className="text-gold font-bold hover:underline transition-colors uppercase font-label text-[10px] tracking-widest ml-1">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
