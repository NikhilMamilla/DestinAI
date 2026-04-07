import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function InnerNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (window.scrollY > 20) setMobileMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Planner', path: '/planner' },
    { name: 'Booking', path: '/booking' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-midnight/90 backdrop-blur-xl border-b border-white/5 py-4 shadow-xl' : 'bg-transparent py-6'}`}>
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 flex justify-between items-center relative z-[110]">
        
        {/* Logo */}
        <div 
          className="font-display text-2xl font-bold tracking-widest uppercase text-white cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => navigate('/home')}
        >
          DESTIN<span className="text-gold">AI</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`font-label text-[10px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer border-none bg-transparent ${
                  location.pathname === link.path ? 'text-gold' : 'text-white/60 hover:text-white'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-white/10 mx-2"></div>

          {/* User Profile / Sign Out */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="font-label text-[9px] text-white/40 uppercase tracking-widest leading-none mb-1">Authenticated</span>
              <span className="font-body text-[11px] text-white font-medium">{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
            </div>
            
            <button 
              onClick={handleSignOut}
              className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer group"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-gold transition-colors focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Overlay */}
      <div className={`lg:hidden fixed inset-0 w-full h-screen bg-[#070F1A] z-40 transition-all duration-400 flex flex-col justify-center items-center ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex flex-col items-center gap-8 px-6 w-full max-w-sm">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
              className={`font-label text-sm font-bold tracking-[0.3em] uppercase transition-all w-full text-center border-none bg-transparent ${
                location.pathname === link.path ? 'text-gold' : 'text-white/80 hover:text-gold'
              }`}
            >
              {link.name}
            </button>
          ))}
          
          <div className="w-16 h-px bg-white/10 my-4"></div>
          
          <div className="text-center mb-4">
              <span className="font-label text-[10px] text-white/30 uppercase tracking-[0.2em] block mb-1">User</span>
              <span className="font-body text-white text-base">{user?.displayName || user?.email || 'Authenticated Traveler'}</span>
          </div>

          <button 
            onClick={handleSignOut}
            className="w-full max-w-[240px] px-8 py-4 rounded-md border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-bold tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
