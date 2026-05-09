import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (window.scrollY > 50) setMobileMenuOpen(false); // auto-close on scroll
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const DestinationCard = ({ img, title, duration, match, rotation, className = "" }: any) => (
    <div className={`absolute inset-0 transition-all duration-700 ease-out origin-bottom-right ${rotation} ${className}`}>
      <div className="relative aspect-[4/5] w-full rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 group">
          <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A2E] via-[#0B1A2E]/40 to-transparent opacity-90"></div>
          <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
              <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold font-label text-[10px] tracking-widest uppercase backdrop-blur-md">
                      Featured Route
                  </span>
                  <span className="font-label text-[10px] text-white/60 tracking-widest uppercase">
                      AI Generated
                  </span>
              </div>
              <h3 className="font-editorial text-4xl text-white mb-6 drop-shadow-lg leading-tight">{title}</h3>
              <div className="grid grid-cols-2 gap-4 mt-2 pt-6 border-t border-white/10">
                  <div className="flex flex-col">
                      <span className="font-label text-xs text-white/50 uppercase tracking-[0.2em] mb-1">Duration</span>
                      <span className="font-stat text-3xl text-white tracking-widest">{duration}</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="font-label text-xs text-white/50 uppercase tracking-[0.2em] mb-1">Match</span>
                      <span className="font-stat text-3xl text-gold tracking-widest">{match}%</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );

  return (
    <div className="bg-mist-100 min-h-screen selection:bg-gold/30 selection:text-midnight">
      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-midnight/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] py-4' : 'bg-transparent py-8'}`}>
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 flex justify-between items-center relative z-[60]">
          <div className="font-display text-3xl font-bold tracking-widest uppercase text-white cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            DESTIN<span className="text-gold">AI</span>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex gap-8 items-center">
            <button onClick={() => document.getElementById('agents')?.scrollIntoView({ behavior: 'smooth' })} className="font-label text-[10px] font-bold tracking-widest uppercase text-white/80 hover:text-gold border-none bg-transparent cursor-pointer transition-colors duration-200">4 Pillars</button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="font-label text-[10px] font-bold tracking-widest uppercase text-white/80 hover:text-gold border-none bg-transparent cursor-pointer transition-colors duration-200">Methodology</button>
            <button onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })} className="font-label text-[10px] font-bold tracking-widest uppercase text-white/80 hover:text-gold border-none bg-transparent cursor-pointer transition-colors duration-200">Trending Escapes</button>
            <button onClick={() => document.getElementById('engine')?.scrollIntoView({ behavior: 'smooth' })} className="font-label text-[10px] font-bold tracking-widest uppercase text-white/80 hover:text-gold border-none bg-transparent cursor-pointer transition-colors duration-200">Private Concierge</button>
            <div className="w-px h-4 bg-white/20 mx-2"></div>
            <button onClick={() => navigate('/login')} className="font-label text-xs font-semibold tracking-widest uppercase text-white/80 hover:text-gold bg-transparent border-none cursor-pointer transition-colors duration-200">Log In</button>
            <button onClick={() => navigate('/login')} className="font-label inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-md transition-all duration-200 bg-gold text-midnight hover:bg-[#D48500] hover:shadow-[0_8px_32px_rgba(255,183,64,0.45)] active:scale-95 cursor-pointer border-none shadow-sm">
              Start Planning
            </button>
          </div>

          {/* MOBILE HAMBURGER TOGGLE */}
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

        {/* MOBILE FULL-SCREEN MENU */}
        <div className={`lg:hidden fixed inset-0 w-full h-screen bg-[#070F1A] z-40 transition-all duration-400 flex flex-col justify-center items-center ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
          <div className="flex flex-col items-center gap-8 px-6 w-full max-w-sm">
            <button onClick={() => { document.getElementById('agents')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="font-label text-sm md:text-base font-bold tracking-[0.3em] uppercase text-white hover:text-gold w-full text-center border-none bg-transparent">4 Pillars</button>
            <button onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="font-label text-sm md:text-base font-bold tracking-[0.3em] uppercase text-white hover:text-gold w-full text-center border-none bg-transparent">Methodology</button>
            <button onClick={() => { document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="font-label text-sm md:text-base font-bold tracking-[0.3em] uppercase text-white hover:text-gold w-full text-center border-none bg-transparent">Trending Escapes</button>
            <button onClick={() => { document.getElementById('engine')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="font-label text-sm md:text-base font-bold tracking-[0.3em] uppercase text-white hover:text-gold w-full text-center border-none bg-transparent">Private Concierge</button>
            <div className="w-16 h-px bg-white/10 my-2"></div>
            <button onClick={() => navigate('/login')} className="font-label text-sm md:text-base font-semibold tracking-widest uppercase text-white/80 hover:text-gold w-full text-center border-none bg-transparent">Log In</button>
            <button onClick={() => navigate('/login')} className="font-label w-full max-w-[240px] text-center px-8 py-4 rounded-md bg-gold text-midnight hover:bg-[#D48500] text-sm md:text-base font-bold tracking-widest uppercase shadow-[0_8px_32px_rgba(255,183,64,0.3)] border-none transition-transform active:scale-95 mt-4">
              Start Planning
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative w-full min-h-screen flex items-center bg-midnight overflow-hidden pt-20">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-atlas rounded-full blur-[150px] opacity-40 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-800 rounded-full blur-[120px] opacity-20 -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>
        
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6 animate-slide-in-l pt-10 md:pt-0 text-center lg:text-left items-center lg:items-start">
            <span className="font-label text-xs font-bold uppercase text-gold tracking-[0.4em]">Welcome to the future of travel</span>
            <h1 className="font-display font-bold leading-tight tracking-wide text-white text-5xl md:text-7xl lg:text-8xl">
              Redefine Your <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-200 to-teal-400 drop-shadow-[0_0_20px_rgba(255,183,64,0.4)]">Voyage</span>
            </h1>
            <p className="font-body text-mist-500 max-w-lg text-base md:text-lg leading-relaxed mt-2 mx-auto lg:mx-0">
              Experience the world seamlessly. Our dynamic constellation of AI Agents researches destinations, maps exact navigation loops, and executes hotel bookings natively in real-time.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-6 w-full sm:w-auto justify-center lg:justify-start">
              <button 
                onClick={() => navigate('/login')} 
                className="w-full sm:w-auto font-label inline-flex items-center justify-center gap-3 text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-md transition-all duration-300 bg-gold text-midnight hover:bg-[#D48500] hover:shadow-[0_8px_32px_rgba(255,183,64,0.45)] active:scale-95 border-none cursor-pointer group"
              >
                Open AI Planner
                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="w-full sm:w-auto font-label inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-md transition-all duration-200 bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm active:scale-95 cursor-pointer"
              >
                Book Hotels
              </button>
            </div>
          </div>
          
          <div className="relative animate-fade-in lg:ml-auto w-full max-w-[380px] pb-10 md:pb-0 h-[475px] group/stack">
            {/* Elegant Playing Cards Stack */}
            <DestinationCard 
              img="/pexels-trung-huynh-30350949-6923292.jpg" 
              title="Kyoto Temples" 
              duration="4 DAYS" 
              match="98.2" 
              rotation="-rotate-12"
              className="translate-x-4 -translate-y-2 opacity-40 group-hover/stack:-translate-x-44 group-hover/stack:-translate-y-12 group-hover/stack:-rotate-[30deg] group-hover/stack:opacity-95 group-hover/stack:scale-105"
            />
            <DestinationCard 
              img="/pexels-omid-visuals-2565301-4159997.jpg" 
              title="Tropical Atoll" 
              duration="7 DAYS" 
              match="97.5" 
              rotation="-rotate-6"
              className="translate-x-2 -translate-y-1 opacity-60 group-hover/stack:-translate-x-24 group-hover/stack:-translate-y-6 group-hover/stack:-rotate-[15deg] group-hover/stack:opacity-95 group-hover/stack:scale-105"
            />
            <DestinationCard 
              img="/pexels-asadphoto-28408433.jpg" 
              title="Maldives Archipelago" 
              duration="5 DAYS" 
              match="99.8" 
              rotation="rotate-0"
              className="z-20 shadow-[0_32px_80px_rgba(0,10,20,0.8)] group-hover/stack:scale-110 group-hover/stack:shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
            />
          </div>
        </div>
      </section>

      {/* FIXED METRICS SECTION - Fixed missing Tailwind bg error to generate deep blue contrast */}
      <section className="bg-[#1A3A5C] py-12 border-y border-white/10 relative z-20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-[1440px] mx-auto px-6 flex flex-wrap justify-center lg:justify-between items-center gap-10 text-center lg:pl-28 lg:pr-28">
            <div className="flex flex-col items-center">
                <span className="font-stat text-[64px] lg:text-[96px] text-gold tracking-wider drop-shadow-md">4,200+</span>
                <span className="font-label text-mist-500 mt-1 tracking-[0.3em] text-xs">Destinations</span>
            </div>
            <div className="w-px h-16 bg-white/10 hidden lg:block"></div>
            <div className="flex flex-col items-center">
                <span className="font-stat text-[64px] lg:text-[96px] text-teal-300 tracking-wider drop-shadow-md">100%</span>
                <span className="font-label text-mist-500 mt-1 tracking-[0.3em] text-xs">AI Powered</span>
            </div>
            <div className="w-px h-16 bg-white/10 hidden lg:block"></div>
            <div className="flex flex-col items-center">
                <span className="font-stat text-[64px] lg:text-[96px] text-mist-300 tracking-wide drop-shadow-md">20 MS</span>
                <span className="font-label text-mist-500 mt-1 tracking-[0.3em] text-xs">Query Speed</span>
            </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="agents" className="py-24 bg-mist-100">
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-label text-aurora-600 tracking-[0.3em] mb-4 block text-xs">Intelligent Engine</span>
                <h2 className="font-display text-midnight text-4xl md:text-5xl font-bold tracking-wide">The 4 Pillars of Travel</h2>
                <div className="w-12 h-0.5 bg-gold my-6 mx-auto"></div>
                <p className="font-body text-ink-muted text-lg leading-relaxed">
                    DESTINAI replaces manual tabs and spreadsheets with coordinated autonomous agents operating directly within your browser.
                </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Agent Card 1 */}
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(11,26,46,0.08)] p-8 border border-white hover:border-gold/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(11,26,46,0.14)] transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <span className="text-2xl drop-shadow-sm">🌍</span>
                    </div>
                    <h3 className="font-editorial text-2xl text-midnight mb-3 tracking-wide">Recommendation</h3>
                    <p className="font-body text-sm text-ink-muted leading-relaxed">Our AI evaluates your historical data and current pins to suggest complementary nearby destinations.</p>
                </div>

                {/* Agent Card 2 */}
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(11,26,46,0.08)] p-8 border border-white hover:border-teal-500/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(11,26,46,0.14)] transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500/30 to-teal-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <span className="text-2xl">🗺️</span>
                    </div>
                    <h3 className="font-editorial text-2xl text-midnight mb-3 tracking-wide">Navigation</h3>
                    <p className="font-body text-sm text-ink-muted leading-relaxed">Generates step-by-step looping itineraries estimating optimal travel modes dynamically over Map APIs.</p>
                </div>

                {/* Agent Card 3 */}
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(11,26,46,0.08)] p-8 border border-white hover:border-midnight/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(11,26,46,0.14)] transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-midnight/20 to-midnight/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <span className="text-2xl">🏨</span>
                    </div>
                    <h3 className="font-editorial text-2xl text-midnight mb-3 tracking-wide">Instant Booking</h3>
                    <p className="font-body text-sm text-ink-muted leading-relaxed">Aggregates nearby lodging options alongside Google Places and routes bookings directly to Firestore.</p>
                </div>

                {/* Agent Card 4 */}
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(11,26,46,0.08)] p-8 border border-white hover:border-aurora-500/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(11,26,46,0.14)] transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-aurora-500/10 rounded-full blur-xl"></div>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-aurora-500/30 to-aurora-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                        <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="font-editorial text-2xl text-midnight mb-3 tracking-wide">Conversational</h3>
                    <p className="font-body text-sm text-ink-muted leading-relaxed">A global chat component powered natively by Mistral AI that reads your screen context to help anywhere.</p>
                </div>
            </div>
        </div>
      </section>

      {/* NEW: HOW IT WORKS (The Journey Map) */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-mist-100/50 rounded-l-[100px] opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 border-[40px] border-gold/5 rounded-full -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16 relative z-10">
          <div className="flex flex-col-reverse md:flex-row gap-16 lg:gap-24 items-center">
            {/* Visual Column: Vertical Timeline */}
            <div className="w-full md:w-1/2 flex flex-col gap-10 relative pb-4">
              {/* Connecting Line */}
              <div className="absolute left-8 h-full w-px bg-midnight/10 top-0 hidden md:block"></div>
              
              {/* Step 1 */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="w-16 h-16 rounded-full bg-gold shrink-0 border-[6px] border-white shadow-[0_8px_24px_rgba(255,183,64,0.3)] flex items-center justify-center font-stat text-2xl text-midnight">1</div>
                <div className="pt-2">
                  <span className="font-label text-[10px] uppercase text-gold tracking-widest block mb-1">Set Parameters</span>
                  <h4 className="font-editorial text-2xl text-midnight mb-2">The Intuitive Input</h4>
                  <p className="font-body text-ink-muted text-sm leading-relaxed max-w-sm">Tell DESTINAI your exact aesthetic. Whether it's a bustling Tokyo street or a silent Tuscan villa, just type your vibe.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start relative z-10 pt-4">
                <div className="w-16 h-16 rounded-full bg-teal-500 shrink-0 border-[6px] border-white shadow-[0_8px_24px_rgba(13,110,110,0.3)] flex items-center justify-center font-stat text-2xl text-white">2</div>
                <div className="pt-2">
                  <span className="font-label text-[10px] uppercase text-teal-600 tracking-widest block mb-1">Global Scan</span>
                  <h4 className="font-editorial text-2xl text-midnight mb-2">Automated Discovery</h4>
                  <p className="font-body text-ink-muted text-sm leading-relaxed max-w-sm">Our autonomous agents sweep globally, evaluating thousands of APIs instantly to match the exact mathematical coordinates of your mood.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start relative z-10 pt-4">
                <div className="w-16 h-16 rounded-full bg-midnight shrink-0 border-[6px] border-white shadow-[0_8px_24px_rgba(11,26,46,0.3)] flex items-center justify-center font-stat text-2xl text-white">3</div>
                <div className="pt-2">
                  <span className="font-label text-[10px] uppercase text-aurora-600 tracking-widest block mb-1">Final Sequence</span>
                  <h4 className="font-editorial text-2xl text-midnight mb-2">Instant Orchestration</h4>
                  <p className="font-body text-ink-muted text-sm leading-relaxed max-w-sm">The Navigation network locks your transport modes while the Booking node instantly secures your verified luxury stays.</p>
                </div>
              </div>
            </div>

            {/* Text Column */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
              <span className="font-label text-[10px] uppercase text-midnight/50 tracking-[0.3em] block mb-4">The Methodology</span>
              <h2 className="font-display text-4xl md:text-5xl text-midnight leading-tight mb-6 mt-2">
                From Inspiration to <span className="italic font-editorial text-[#D48500]">Execution</span> in Seconds.
              </h2>
              <div className="w-12 h-0.5 bg-gold mb-6 mx-auto md:mx-0"></div>
              <p className="font-body text-base md:text-lg text-ink-muted leading-relaxed mb-8 max-w-lg">
                Traditional travel planning involves 14 separate tabs, scattered spreadsheets, and overwhelming cognitive load. DESTINAI utilizes an autonomous hive of large language models to construct raw visual inspiration directly into booked itineraries automatically.
              </p>
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto font-label text-xs uppercase text-white bg-midnight hover:bg-[#1A3A5C] px-8 py-4 rounded transition-all duration-300 tracking-widest cursor-pointer shadow-dark hover:-translate-y-1">
                Watch It Work Workflow →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: TRENDING ESCAPES (Bento/Asymmetric Gallery) */}
      <section id="destinations" className="py-16 lg:py-20 bg-midnight border-t border-white/5 relative overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-6 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <span className="font-label text-[10px] uppercase text-gold tracking-[0.3em] block mb-4">Curated Intelligence</span>
              <h2 className="font-display text-4xl md:text-5xl text-white leading-tight">Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-500 pr-1">Escapes</span></h2>
            </div>
            <button className="font-label text-[10px] uppercase text-white/70 tracking-widest border-b border-white/30 pb-1 hover:text-gold hover:border-gold transition-colors cursor-pointer block mt-2 md:mt-0">
              View All Destinations →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:auto-rows-[240px]">
            {/* Gallery Item 1 (Tall / spans 2 rows based on grid structure mentally, we force height with CSS in flex child) */}
            <div className="md:row-span-2 relative rounded-[20px] overflow-hidden group cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.6)] h-[400px] md:h-full">
              <img src="/pexels-trung-huynh-30350949-6923292.jpg" alt="Kyoto temples" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/20 to-transparent opacity-90 transition-opacity"></div>
              <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
                <span className="font-label text-[10px] uppercase text-mist-400 tracking-widest mb-2">Culture & Silence</span>
                <h3 className="font-editorial text-4xl text-white mb-2">Kyoto Temples, JP</h3>
                <span className="font-stat text-2xl text-gold">4 NIGHTS</span>
              </div>
            </div>
            
            {/* Gallery Item 2 (Wide) */}
            <div className="md:col-span-2 relative rounded-[20px] overflow-hidden group cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.6)] h-[250px] md:h-full">
              <img src="/pexels-omid-visuals-2565301-4159997.jpg" alt="Tropical Escape" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1000ms]" />
              <div className="absolute inset-0 bg-[#1A3A5C]/10 group-hover:bg-transparent transition-colors duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent opacity-90"></div>
              <div className="absolute inset-x-0 bottom-0 p-8 flex items-end justify-between">
                 <div>
                   <span className="font-label text-[10px] uppercase text-teal-300 tracking-widest mb-2 block">Tropical Isolation</span>
                   <h3 className="font-editorial text-3xl text-white">The Hidden Atolls</h3>
                 </div>
                 <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white backdrop-blur-md group-hover:bg-gold transition-colors group-hover:text-midnight group-hover:border-gold shadow-lg">
                    →
                 </div>
               </div>
            </div>

            {/* Gallery Item 3 (Wide CTA box) */}
            <div className="md:col-span-2 relative rounded-[20px] overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.6)] bg-gradient-to-br from-[#1A3A5C] to-[#0B1A2E] flex items-center justify-center border border-white/10 h-[280px] md:h-full">
              {/* Abstract graphic replacing image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-aurora-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="text-center relative z-10 px-8 w-full max-w-lg">
                <span className="font-display text-3xl md:text-4xl text-white block mb-4">Where to Next?</span>
                <p className="font-body text-white/50 mb-6 text-sm leading-relaxed">Input your preferences and let our AI generate endless possibilities specifically mapped to your unique parameters.</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => navigate('/login')} className="font-label text-[10px] uppercase text-midnight bg-gold px-8 py-3.5 rounded tracking-widest hover:scale-105 transition-transform cursor-pointer shadow-[0_4px_20px_rgba(255,183,64,0.3)]">
                      Generate Destination
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: CONVERSATIONAL ENGINE SHOWCASE */}
      <section id="engine" className="py-24 lg:py-32 bg-[#070F1A] border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-aurora-500/30 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-aurora-700/10 rounded-full blur-[120px] pointer-events-none translate-y-1/2 translate-x-1/4"></div>
        
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Mock App Window */}
          <div className="relative w-full max-w-[450px] mx-auto lg:ml-auto lg:mr-0 aspect-[4/5] md:aspect-square lg:aspect-[4/5] min-h-[440px] bg-midnight/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.1)] overflow-hidden flex flex-col z-10">
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center px-4 md:px-6 gap-4 shrink-0">
              <div className="flex gap-2 shrink-0">
                <div className="w-3 h-3 rounded-full bg-white/10"></div>
                <div className="w-3 h-3 rounded-full bg-white/10"></div>
                <div className="w-3 h-3 rounded-full bg-mist-500/20"></div>
              </div>
              <div className="font-label text-[9px] md:text-[10px] text-white/40 tracking-widest mx-auto flex gap-1.5 md:gap-2 items-center flex-1 justify-center">
                 <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0"></span> MISTRAL AI CONNECTED
              </div>
            </div>
            
            {/* Body */}
            <div className="flex-1 p-4 md:p-6 flex flex-col gap-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] overflow-y-auto">
               <div className="mt-auto"></div>
               {/* User Bubble */}
               <div className="self-end max-w-[95%] md:max-w-[85%] bg-white/5 backdrop-blur-md border border-white/10 text-white font-body p-4 rounded-2xl rounded-tr-sm text-[13px] md:text-sm shadow-md animate-fade-in leading-relaxed">
                 I need a quiet villa in Santorini for next Friday. It must have a private pool and cost under €400/night.
               </div>
               
               {/* AI Bubble */}
               <div className="self-start max-w-[95%] bg-gradient-to-br from-[#1A3A5C] to-midnight border border-aurora-500/20 text-white font-body p-4 md:p-5 rounded-2xl rounded-tl-sm text-[13px] md:text-sm relative shadow-xl transform origin-bottom-left animate-slide-up leading-relaxed" style={{animationDelay: '0.4s'}}>
                 <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-aurora-500 flex items-center justify-center text-[10px] shadow-[0_0_12px_rgba(139,92,246,0.6)] text-white">⚡</div>
                 <p className="mb-4 text-white/90">I've scanned the Aegean database matching your exact parameters for next Friday.</p>
                 
                 <div className="bg-[#070F1A] border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center cursor-pointer hover:border-gold/30 transition-colors">
                    <img src="/pexels-asadphoto-28408433.jpg" className="w-full sm:w-16 h-28 sm:h-12 rounded bg-white/10 object-cover shrink-0" />
                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                      <span className="block font-editorial text-[16px] text-gold tracking-wide truncate">Astra Suites Villa</span>
                      <span className="block font-body text-[10px] md:text-[11px] text-mist-500 uppercase tracking-widest break-words leading-tight truncate">Private Pool • €380/Night</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="flex flex-col gap-5 lg:pl-8 z-10 items-center lg:items-start text-center lg:text-left mt-8 lg:mt-0">
            <span className="font-label text-[10px] uppercase text-aurora-400 tracking-[0.3em] font-bold">LPU-Powered Assistant</span>
            <h2 className="font-display text-4xl md:text-5xl text-white leading-tight">
              A Private Concierge. <br className="hidden lg:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-aurora-400 to-aurora-600 lg:pr-1">Always Listening.</span>
            </h2>
            <div className="w-12 h-0.5 bg-aurora-500 mb-2 mx-auto lg:mx-0"></div>
            <p className="font-body text-base md:text-lg text-mist-500 leading-relaxed max-w-lg mb-4">
              Unlike traditional booking agents, our globally persistent chat interface powered by Mistral AI reads your immediate screen context. Ask it about the hotel you're currently viewing, or direct it to construct a multi-city tour while you browse the map.
            </p>
            <ul className="flex flex-col gap-4 mt-2 text-left w-full max-w-sm mx-auto lg:mx-0">
              <li className="flex items-center gap-4 text-mist-300 font-body text-sm md:text-[15px]">
                 <span className="w-6 h-6 rounded-full bg-aurora-500/10 border border-aurora-500/30 text-aurora-400 flex items-center justify-center text-[10px] shrink-0">✔</span>
                  Sub-second inference via Mistral
              </li>
              <li className="flex items-center gap-4 text-mist-300 font-body text-sm md:text-[15px]">
                 <span className="w-6 h-6 rounded-full bg-aurora-500/10 border border-aurora-500/30 text-aurora-400 flex items-center justify-center text-[10px] shrink-0">✔</span>
                 Context-aware browser state reading
              </li>
              <li className="flex items-center gap-4 text-mist-300 font-body text-sm md:text-[15px]">
                 <span className="w-6 h-6 rounded-full bg-aurora-500/10 border border-aurora-500/30 text-aurora-400 flex items-center justify-center text-[10px] shrink-0">✔</span>
                 Executes Maps & Event mutations autonomously
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="bg-gold py-32 relative overflow-hidden border-t-[8px] border-midnight">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] opacity-30 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D48500] rounded-full blur-[100px] opacity-40 pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
         
         <div className="w-full max-w-[800px] mx-auto px-6 text-center relative z-10 flex flex-col items-center">
            <span className="font-label text-[10px] uppercase text-midnight/60 tracking-[0.4em] font-bold mb-6">Start Your Journey</span>
            <h2 className="font-display text-5xl md:text-7xl text-midnight font-bold mb-6 leading-tight">Stop Searching. <br/> Start Traveling.</h2>
            <p className="font-body text-lg md:text-xl text-midnight/80 leading-relaxed mb-10 max-w-lg">
              Join thousands of modern travelers who have completely outsourced their itinerary stress to our autonomous network.
            </p>
            <button onClick={() => navigate('/login')} className="font-label text-xs uppercase text-gold bg-midnight hover:bg-[#1A3A5C] px-10 py-5 rounded-md tracking-widest shadow-[0_12px_40px_rgba(11,26,46,0.3)] active:scale-95 transition-all duration-300 cursor-pointer border border-midnight">
              Create Free Account →
            </button>
         </div>
      </section>

      {/* ENHANCED PROFESSIONAL FOOTER */}
      <footer className="bg-[#070F1A] pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#1A3A5C] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-8 mb-16">
                
                {/* Brand Column */}
                <div className="lg:w-1/3 flex flex-col gap-6 items-center lg:items-start text-center lg:text-left">
                    <div className="font-display text-3xl font-bold tracking-widest text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                        DESTIN<span className="text-gold">AI</span>
                    </div>
                    <p className="font-body text-mist-500/70 text-sm leading-relaxed max-w-sm">
                        An autonomous travel intelligence network. Bypassing infinite tabs and routing your exact aesthetic into booked reality.
                    </p>
                    <div className="flex gap-4 mt-2 justify-center lg:justify-start">
                        {/* X (Twitter) Icon */}
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:border-gold/30 hover:text-gold transition-all duration-300 transform hover:-translate-y-1" title="Follow on X">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                        </a>
                        {/* LinkedIn Icon */}
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:border-gold/30 hover:text-gold transition-all duration-300 transform hover:-translate-y-1" title="Connect on LinkedIn">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"></path>
                            </svg>
                        </a>
                        {/* GitHub Icon */}
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:border-gold/30 hover:text-gold transition-all duration-300 transform hover:-translate-y-1" title="View Source on GitHub">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Link Columns Wrapper */}
                <div className="lg:w-3/5 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 w-full max-w-2xl mx-auto lg:mx-0">
                    {/* Links: Platform */}
                    <div className="flex flex-col gap-4 sm:gap-5 items-start text-left">
                        <span className="font-label text-[10px] uppercase text-white/40 tracking-[0.2em] mb-1 block">Platform</span>
                        <a href="#agents" className="font-body text-sm text-mist-500/80 hover:text-gold transition-colors">AI Planner</a>
                        <a href="#agents" className="font-body text-sm text-mist-500/80 hover:text-gold transition-colors">Instant Booking</a>
                        <a href="#agents" className="font-body text-sm text-mist-500/80 hover:text-gold transition-colors">Navigation Engine</a>
                        <a href="#agents" className="font-body text-sm text-mist-500/80 hover:text-gold transition-colors flex items-center gap-2">Mistral AI <span className="px-1.5 py-0.5 rounded text-[8px] bg-teal-500/20 text-teal-300 uppercase tracking-widest font-label">NEW</span></a>
                    </div>

                    {/* Links: Company */}
                    <div className="flex flex-col gap-4 sm:gap-5 items-start text-left">
                        <span className="font-label text-[10px] uppercase text-white/40 tracking-[0.2em] mb-1 block">Company</span>
                        <a href="#" className="font-body text-sm text-mist-500/80 hover:text-gold transition-colors">Manifesto</a>
                        <a href="#" className="font-body text-sm text-mist-500/80 hover:text-white transition-colors">Engineering Blog</a>
                        <a href="#" className="font-body text-sm text-mist-500/80 hover:text-white transition-colors">Careers</a>
                        <a href="#" className="font-body text-sm text-mist-500/80 hover:text-white transition-colors">System Status</a>
                    </div>

                    {/* Links: Legal */}
                    <div className="flex flex-col gap-4 sm:gap-5 items-start text-left col-span-2 sm:col-span-1 mt-4 sm:mt-0 pt-6 sm:pt-0 border-t border-white/5 sm:border-0">
                        <span className="font-label text-[10px] uppercase text-white/40 tracking-[0.2em] mb-1 block">Legal</span>
                        <a href="#" className="font-body text-sm text-mist-500/80 hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="font-body text-sm text-mist-500/80 hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="font-body text-sm text-mist-500/80 hover:text-white transition-colors">Cookie Strategy</a>
                        <a href="#" className="font-body text-sm text-mist-500/80 hover:text-white transition-colors hidden md:block">&nbsp;</a> {/* Spacer */}
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-white/5 mb-8"></div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="font-label text-center md:text-left text-[10px] tracking-widest text-mist-500/40 uppercase leading-relaxed">
                    © {new Date().getFullYear()} DESTINAI REAL-TIME PLATFORM. ALL RIGHTS RESERVED.
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full cursor-pointer hover:bg-white/10 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                    <span className="font-label text-[10px] tracking-widest text-white/70 uppercase">Systems Operational</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
