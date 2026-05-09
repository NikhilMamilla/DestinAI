import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, limit, addDoc, deleteDoc, serverTimestamp, doc } from 'firebase/firestore';
import InnerNavbar from '../components/InnerNavbar';

const DESTINATIONS = [
  { name: 'Leh Ladakh', region: 'India', img: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1400&auto=format&fit=crop', tag: 'Adventure', timezone: 'Asia/Kolkata' },
  { name: 'Kerala Backwaters', region: 'India', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1400&auto=format&fit=crop', tag: 'Serene', timezone: 'Asia/Kolkata' },
  { name: 'Santorini', region: 'Greece', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1400&auto=format&fit=crop', tag: 'Trending', timezone: 'Europe/Athens' },
  { name: 'Jaipur', region: 'India', img: 'https://wallpapers.com/images/hd/jal-mahal-water-palace-jaipur-nighttime-uhki0tnbfn2lgovf.jpg', tag: 'Heritage', timezone: 'Asia/Kolkata' },
  { name: 'Tokyo', region: 'Japan', img: 'https://wallpapercave.com/wp/wp4118244.jpg', tag: 'City Life', timezone: 'Asia/Tokyo' },
  { name: 'Varanasi', region: 'India', img: 'https://as1.ftcdn.net/v2/jpg/02/05/83/04/1000_F_205830494_1IFB9ryk0u3C1cdK55AyykunnE0gnLIf.jpg', tag: 'Spiritual', timezone: 'Asia/Kolkata' },
];

const ACTIVITY_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  trip_saved:         { icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', color: 'text-gold', bg: 'bg-gold/10 border-gold/20' },
  booking_confirmed:  { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5', color: 'text-teal-400', bg: 'bg-teal/10 border-teal/20' },
  plan_generated:     { icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-aurora', bg: 'bg-aurora/10 border-aurora/20' },
  wishlist_added:     { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-coral', bg: 'bg-coral/10 border-coral/20' },
};

const timeAgo = (ts: any): string => {
  if (!ts?.toDate) return '';
  const diff = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return ts.toDate().toLocaleDateString();
};

const getDestinationTime = (timezone: string, date: Date) => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  } catch (e) {
    return '12:00';
  }
};

const getClockRotation = (timezone: string, date: Date) => {
  try {
    const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const s = local.getSeconds();
    const m = local.getMinutes();
    const h = local.getHours() % 12;
    return {
      sec: s * 6,
      min: m * 6 + s * 0.1,
      hour: h * 30 + m * 0.5
    };
  } catch (e) {
    return { sec: 0, min: 0, hour: 0 };
  }
};

const AnalogClock = ({ timezone, date }: { timezone: string; date: Date }) => {
  const { sec, min, hour } = getClockRotation(timezone, date);
  const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  
  return (
    <div className="relative w-28 h-28 rounded-full border-[3px] border-[#1A1A1A] p-[2px] shadow-[0_20px_40px_rgba(0,0,0,0.9),inset_0_2px_5px_rgba(255,255,255,0.05)] bg-[#121212]">
      <div className="w-full h-full rounded-full bg-[#F7F3EE] relative flex items-center justify-center shadow-inner overflow-hidden">
        {/* Minute Track */}
        {[...Array(60)].map((_, i) => (
          <div key={i} className={`absolute w-[0.5px] ${i % 5 === 0 ? 'h-2' : 'h-1'} bg-[#0B1A2E]/30`} style={{ transform: `rotate(${i * 6}deg) translateY(-48px)` }} />
        ))}
        
        {/* Roman Numerals */}
        {[0, 3, 6, 9].map(i => (
          <span 
            key={i} 
            className="absolute font-editorial text-[11px] font-bold text-[#0B1A2E] leading-none"
            style={{ 
              transform: `rotate(${i * 30}deg) translateY(-36px) rotate(${-i * 30}deg)` 
            }}
          >
            {ROMAN[i]}
          </span>
        ))}

        {/* DestinAI Logo */}
        <div className="absolute top-[28%] w-full text-center">
            <p className="font-display text-[6px] font-bold text-[#0B1A2E]/20 uppercase tracking-[0.3em]">DestinAI</p>
        </div>

        {/* --- PERFECT CENTER CLOCK HANDS --- */}
        
        {/* Hour Hand Wrapper */}
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out" style={{ transform: `rotate(${hour}deg)` }}>
            <div className="w-[2.5px] h-11 bg-[#0B1A2E] rounded-full absolute bottom-1/2 origin-bottom">
                <div className="w-3 h-3 rounded-full border-[2px] border-[#0B1A2E] bg-white absolute -top-1.5 -left-[5px] flex items-center justify-center" />
            </div>
        </div>

        {/* Minute Hand Wrapper */}
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out" style={{ transform: `rotate(${min}deg)` }}>
            <div className="w-[1.5px] h-16 bg-[#0B1A2E] rounded-full absolute bottom-1/2 origin-bottom">
                <div className="w-2 h-2 rounded-full border-[1.5px] border-[#0B1A2E] bg-white absolute -top-1 -left-[3px] flex items-center justify-center" />
            </div>
        </div>

        {/* Second Hand Wrapper */}
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-linear" style={{ transform: `rotate(${sec}deg)` }}>
            <div className="w-[0.5px] h-18 bg-gold rounded-full absolute bottom-1/2 origin-bottom" />
        </div>
        
        {/* Center Nut (Overlays everything for perfect depth) */}
        <div className="w-3 h-3 rounded-full bg-[#0B1A2E] z-10 shadow-[0_3px_5px_rgba(0,0,0,0.4)] border border-white/30 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uniquePlaces, setUniquePlaces] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalWishlist, setTotalWishlist] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tick, setTick] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      // Cleanup previous listeners if any (e.g. if user switch happens)
      unsubs.forEach(fn => fn());
      unsubs = [];

      if (!u) { setUser(null); setUid(null); setLoading(false); return; }
      setUser(u);
      setUid(u.uid);

      unsubs = [
        // Fetch user specific profile with travel persona
        onSnapshot(
          doc(db, 'users', u.uid),
          s => { if (s.exists()) setUserProfile(s.data()); },
          console.error
        ),
        // Live Global Telemetry - Trips
        onSnapshot(
          collection(db, 'users', u.uid, 'trips'),
          s => {
            setTotalTrips(s.size);
            const latest = s.docs.sort((a:any, b:any) => b.data().createdAt?.seconds - a.data().createdAt?.seconds).slice(0, 4);
            setTrips(latest.map(d => ({ id: d.id, ...d.data() })));
            const all = new Set(s.docs.flatMap((t: any) => t.data().places?.map((p: any) => p.name) || []));
            setUniquePlaces(all.size);
          }, console.error
        ),
        // Live Global Telemetry - Bookings
        onSnapshot(
          collection(db, 'users', u.uid, 'bookings'),
          s => {
             setTotalBookings(s.size);
             const latest = s.docs.sort((a:any, b:any) => b.data().createdAt?.seconds - a.data().createdAt?.seconds).slice(0, 3);
             setBookings(latest.map(d => ({ id: d.id, ...d.data() })));
             setLoading(false);
          }, console.error
        ),
        onSnapshot(
          query(collection(db, 'users', u.uid, 'activities'), orderBy('createdAt', 'desc'), limit(8)),
          s => setActivities(s.docs.map(d => ({ id: d.id, ...d.data() }))),
          console.error
        ),
        onSnapshot(
          collection(db, 'users', u.uid, 'wishlist'),
          s => {
            setTotalWishlist(s.size);
            setWishlist(s.docs.map(d => ({ id: d.id, ...d.data() })));
          },
          console.error
        ),
      ];
    });

    return () => {
      unsubAuth();
      unsubs.forEach(fn => fn());
    };
  }, []);

  const isWishlisted = (name: string) => wishlist.some(w => w.name === name);

  const toggleWishlist = async (dest: typeof DESTINATIONS[0]) => {
    if (!uid) return;
    const existing = wishlist.find(w => w.name === dest.name);
    if (existing) {
      await deleteDoc(doc(db, 'users', uid, 'wishlist', existing.id));
    } else {
      await addDoc(collection(db, 'users', uid, 'wishlist'), {
        name: dest.name, region: dest.region, img: dest.img,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'users', uid, 'activities'), {
        type: 'wishlist_added', icon: 'heart',
        title: 'Added to Wishlist', subtitle: `${dest.name}, ${dest.region}`,
        createdAt: serverTimestamp(),
      });
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
  };
  const firstName = user?.displayName?.split(' ')[0] || 'Traveler';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate('/planner');
  };

  return (
    <div className="min-h-screen bg-midnight selection:bg-gold/30 selection:text-midnight overflow-x-hidden">
      <InnerNavbar />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative pt-36 pb-16 px-6 md:px-10 lg:px-16 w-full max-w-[1440px] mx-auto overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-midnight-500 rounded-full blur-[160px] opacity-20 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 animate-fade-up">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-label text-[10px] text-gold uppercase tracking-[0.4em]">{getGreeting()}</span>
              <span className="w-8 h-px bg-gold/40" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-white font-bold tracking-wide mb-3 capitalize">
              Welcome back, <span className="text-gold">{firstName}</span> 
              <span className="text-[10px] ml-4 font-label text-white/20 uppercase tracking-[0.4em] border-l border-white/10 pl-4">{userProfile?.travelStyle || 'Explorer'} Traveler</span>
            </h1>
            <p className="font-body text-mist-500 text-base max-w-lg leading-relaxed">
              Your AI-powered travel concierge is ready. Plan your next escape or review your saved journeys.
            </p>
          </div>

          {/* Live stats */}
          <div className="flex gap-3 shrink-0">
            {[
              { value: loading ? '–' : totalTrips, label: 'Trips', color: 'text-gold' },
              { value: loading ? '–' : totalBookings, label: 'Bookings', color: 'text-teal-400' },
              { value: loading ? '–' : uniquePlaces, label: 'Places', color: 'text-white' },
              { value: loading ? '–' : totalWishlist, label: 'Wishlist', color: 'text-coral' },
            ].map((s, i) => (
              <div key={i} className="glass-dark rounded-2xl px-4 py-3 text-center min-w-[76px]">
                <div className={`font-stat text-2xl ${s.color} leading-none mb-0.5`}>{s.value}</div>
                <div className="font-label text-[9px] text-white/30 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative mt-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Where do you want to go next? Try 'Paris', 'Bali', 'New York'..."
            className="w-full pl-14 pr-36 py-4 glass-dark rounded-2xl text-base text-white placeholder:text-white/20 font-body focus:outline-none focus:border-gold transition-all shadow-dark"
          />
          <button type="submit" className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-5 py-2.5">
            Plan Trip
          </button>
        </form>
      </section>

      {/* ── QUICK ACTIONS ────────────────────────── */}
      <section className="px-6 md:px-10 lg:px-16 w-full max-w-[1440px] mx-auto mb-12">
        <div className="grid md:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '0.12s' }}>
          {[
            { path: '/planner', color: 'gold', title: 'AI Travel Planner', desc: 'Build multi-stop itineraries with AI intelligence & live routing', cta: 'Launch Planner', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', hoverBorder: 'hover:border-gold/40 hover:shadow-gold', iconColor: 'text-gold', iconBg: 'bg-gold/10 border-gold/20', ctaColor: 'text-gold' },
            { path: '/booking', color: 'teal', title: 'Hotel Finder', desc: 'Discover & book premium accommodations in seconds', cta: 'Search Hotels', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1', hoverBorder: 'hover:border-teal/40 hover:shadow-teal', iconColor: 'text-teal-400', iconBg: 'bg-teal/10 border-teal/20', ctaColor: 'text-teal-400' },
          ].map((a, i) => (
            <div key={i} onClick={() => navigate(a.path)} className={`group card-dark rounded-2xl p-5 cursor-pointer ${a.hoverBorder} transition-all duration-300 flex items-center gap-5`}>
              <div className={`w-11 h-11 rounded-xl ${a.iconBg} border flex items-center justify-center ${a.iconColor} shrink-0 group-hover:scale-110 transition-transform`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={a.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base text-white font-bold tracking-wide mb-0.5">{a.title}</h3>
                <p className="font-body text-mist-500 text-xs leading-relaxed">{a.desc}</p>
              </div>
              <span className={`font-label text-[9px] ${a.ctaColor} uppercase tracking-widest shrink-0 flex items-center gap-1 group-hover:gap-2 transition-all`}>
                {a.cta}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXPLORE DESTINATIONS ─────────────────── */}
      <section className="px-6 md:px-10 lg:px-16 w-full max-w-[1440px] mx-auto mb-12 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display text-xl text-white font-bold tracking-wide flex items-center gap-3">
            <span className="w-5 h-px bg-gold block" />Explore Destinations
          </h2>
          <span className="font-label text-[9px] text-white/20 uppercase tracking-widest">{wishlist.length} saved to wishlist</span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {DESTINATIONS.map((dest, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden cursor-pointer h-52 hover:shadow-gold transition-all duration-500 animate-fade-up" style={{ animationDelay: `${0.18 + i * 0.06}s` }}>
              <img src={dest.img} alt={dest.name} onClick={() => navigate('/planner')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-overlay-dark pointer-events-none" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between" onClick={() => navigate('/planner')}>
                <div className="flex flex-col gap-1.5 items-start">
                  <span className="chip-gold">{dest.tag}</span>
                  {/* Live Metadata Pills */}
                  <div className="flex flex-col gap-1">
                    <div className="glass-dark px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-white/5 animate-pulse">
                      <span className="w-1 h-1 rounded-full bg-gold" />
                      <span className="font-stat text-[8px] text-white/90 uppercase tracking-widest">{dest.tag === 'Trending' ? '24\u00B0C Sunny' : dest.tag === 'Heritage' ? '28\u00B0C Clear' : dest.tag === 'Adventure' ? '12\u00B0C Crisp' : '19\u00B0C Fair'}</span>
                    </div>
                    <div className="glass-dark px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-white/5 opacity-60">
                      <svg className="w-2 h-2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-stat text-[8px] text-white/60 uppercase tracking-widest">Local: {getDestinationTime(dest.timezone, tick)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl text-white font-bold tracking-wide text-shadow">{dest.name}</h3>
                  <p className="font-label text-[9px] text-white/40 uppercase tracking-widest">{dest.region}</p>
                </div>
              </div>
              {/* Wishlist heart button */}
              <button
                onClick={e => { e.stopPropagation(); toggleWishlist(dest); }}
                className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border-none ${
                  isWishlisted(dest.name) ? 'bg-coral text-white shadow-lg' : 'bg-midnight/60 text-white/40 hover:text-coral hover:bg-midnight/80'
                }`}
              >
                <svg className="w-4 h-4" fill={isWishlisted(dest.name) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* \u2500\u2500 MAIN DASHBOARD GRID \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="px-6 md:px-10 lg:px-16 w-full max-w-[1440px] mx-auto pb-28">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* COL 1: Saved Itineraries */}
          <div className="card-dark rounded-3xl flex flex-col min-h-[400px] animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-white/5 shrink-0">
              <h2 className="font-display text-lg text-white font-bold tracking-wide flex items-center gap-3">
                <span className="w-4 h-px bg-gold block" />Saved Itineraries
              </h2>
              <button onClick={() => navigate('/planner')} className="font-label text-[9px] text-white/30 hover:text-gold uppercase tracking-widest transition-colors border-none bg-transparent cursor-pointer">
                + New
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-5 flex flex-col gap-3 overflow-y-auto">
              {loading ? (
                [1,2,3].map((_, idx) => <div key={idx} className="h-20 rounded-xl bg-midnight-700 animate-pulse border border-white/5" />)
              ) : trips.length > 0 ? trips.map((trip) => (
                <div key={trip.id} className="glass-dark p-4 rounded-xl hover:border-gold/30 transition-all duration-300 cursor-pointer group" onClick={() => navigate('/planner')}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="chip-gold">Trip</span>
                      {trip.travelMethod && (
                        <div className="flex items-center gap-1.5 glass-dark px-2 py-0.5 rounded-md border border-white/5">
                           <svg className="w-2.5 h-2.5 text-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                               trip.travelMethod === 'flight' ? "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" :
                               trip.travelMethod === 'rail' ? "M5 13l4 4L19 7" :
                               trip.travelMethod === 'sea' ? "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" :
                               "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1"
                             } />
                           </svg>
                           <span className="font-stat text-[8px] text-white/40 uppercase tracking-widest">{trip.travelMethod}</span>
                        </div>
                      )}
                    </div>
                    <span className="font-label text-[9px] text-white/20">{trip.createdAt?.toDate?.().toLocaleDateString() ?? '—'}</span>
                  </div>
                  <h4 className="font-body text-sm text-white leading-snug line-clamp-1 mb-1 group-hover:text-gold transition-colors">
                    {trip.places?.map((p: any) => p.name).join(' → ') || 'Unnamed Trip'}
                  </h4>
                  {trip.planText && <p className="font-body text-white/30 text-xs line-clamp-1">{trip.planText}</p>}
                </div>
              )) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="w-12 h-12 rounded-2xl glass-dark flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                  </div>
                  <p className="font-body text-white/25 text-sm mb-3">No trips saved yet.</p>
                  <button onClick={() => navigate('/planner')} className="btn-primary btn-sm rounded-xl">Plan First Trip</button>
                </div>
              )}
            </div>
          </div>

          {/* COL 2: Bookings + AI Concierge */}
          <div className="card-dark rounded-3xl flex flex-col min-h-[400px] animate-fade-up" style={{ animationDelay: '0.25s' }}>
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-white/5 shrink-0">
              <h2 className="font-display text-lg text-white font-bold tracking-wide flex items-center gap-3">
                <span className="w-4 h-px bg-teal-500 block" />Bookings
              </h2>
              <button onClick={() => navigate('/booking')} className="font-label text-[9px] text-white/30 hover:text-teal-400 uppercase tracking-widest transition-colors border-none bg-transparent cursor-pointer">
                + New
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-5 flex flex-col gap-3 overflow-y-auto">
              {loading ? (
                [1,2].map((_, idx) => <div key={idx} className="h-16 rounded-xl bg-midnight-700 animate-pulse border border-white/5" />)
              ) : bookings.length > 0 ? bookings.map((b) => (
                <div key={b.id} className="glass-dark p-3.5 rounded-xl flex items-center gap-3 hover:border-teal/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex flex-col items-center justify-center text-teal-400 shrink-0">
                    <span className="font-stat text-[9px] leading-none">{b.createdAt?.toDate?.().toLocaleString('default', { month: 'short' }) ?? '--'}</span>
                    <span className="font-stat text-base leading-none">{b.createdAt?.toDate?.().getDate() ?? '--'}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-display text-sm text-white font-bold truncate group-hover:text-teal-400 transition-colors uppercase tracking-tight">{b.hotelName}</h4>
                      {b.checkIn && (
                        <span className="font-stat text-[8px] text-teal-400/60 border border-teal-400/20 px-1.5 py-0.5 rounded uppercase">
                          {Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24)))} Nights
                        </span>
                      )}
                    </div>
                    <p className="font-body text-white/30 text-[10px] truncate flex items-center gap-1.5">
                      {b.checkIn ? (
                        <>
                          <span className="text-white/60">{new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="opacity-30">→</span>
                          <span className="text-white/60">{new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </>
                      ) : (
                        b.address
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                      <span className="font-label text-[9px] text-teal-400 uppercase tracking-widest">Active</span>
                    </div>
                    {b.checkIn && new Date(b.checkIn).getTime() > new Date().getTime() && (
                      <span className="font-stat text-[8px] text-white/20 uppercase tracking-tighter">
                        In {Math.max(1, Math.ceil((new Date(b.checkIn).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days
                      </span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="w-12 h-12 rounded-2xl glass-dark flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
                  </div>
                  <p className="font-body text-white/25 text-sm mb-3">No reservations yet.</p>
                  <button onClick={() => navigate('/booking')} className="btn-teal btn-sm rounded-xl">Find Hotels</button>
                </div>
              )}
            </div>

            {/* AI concierge pinned at bottom */}
            <div className="px-5 pb-5 shrink-0">
              <div className="glass-gold rounded-xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <p className="font-label text-[9px] text-gold uppercase tracking-widest mb-0.5">AI Concierge</p>
                  <p className="font-body text-white/40 text-xs leading-relaxed">Ask the chat to recommend destinations based on your trips.</p>
                </div>
              </div>
            </div>
          </div>

          {/* COL 3: Live Activity */}
          <div className="card-dark rounded-3xl flex flex-col min-h-[400px] animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5 shrink-0">
              <h2 className="font-display text-lg text-white font-bold tracking-wide flex items-center gap-3">
                <span className="w-4 h-px bg-aurora block" />Live Activity
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="font-label text-[9px] text-teal-400 uppercase tracking-widest">Real-time</span>
              </div>
            </div>

            {/* Feed */}
            <div className="flex-1 p-5 flex flex-col gap-3 overflow-y-auto">
              {activities.length > 0 ? activities.map((a, i) => {
                const meta = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.trip_saved;
                return (
                  <div key={a.id} className="flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className={`w-8 h-8 rounded-xl ${meta.bg} border flex items-center justify-center shrink-0`}>
                      <svg className={`w-3.5 h-3.5 ${meta.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={meta.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-body text-white/70 text-xs font-medium truncate">{a.title}</p>
                        <span className="font-label text-[9px] text-white/20 shrink-0 whitespace-nowrap">{timeAgo(a.createdAt)}</span>
                      </div>
                      <p className="font-body text-white/30 text-xs truncate">{a.subtitle}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="w-12 h-12 rounded-2xl glass-dark flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="font-body text-white/25 text-sm">No activity yet.</p>
                  <p className="font-body text-white/15 text-xs mt-1">Save a trip or book a hotel to see events here.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>


      {/* ── VOYAGER INTELLIGENCE HUB ─────────────────── */}
      <section className="px-6 md:px-10 lg:px-16 w-full max-w-[1440px] mx-auto pb-20 animate-fade-up" style={{ animationDelay: '0.35s' }}>
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* Global Pulse: World Clocks */}
          <div className="lg:w-2/3 glass-dark rounded-3xl p-6 border border-white/5 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="font-display text-sm text-white/40 font-bold tracking-[0.3em] uppercase flex items-center gap-3">
                <span className="w-4 h-px bg-gold/40 block" />Global Pulse
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(255,183,64,0.6)] animate-pulse" />
                <span className="font-label text-[9px] text-gold uppercase tracking-widest">Live Sync</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 py-6">
              {[
                { city: 'London', tz: 'Europe/London', code: 'LHR' },
                { city: 'New York', tz: 'America/New_York', code: 'JFK' },
                { city: 'Tokyo', tz: 'Asia/Tokyo', code: 'HND' },
                { city: 'Sydney', tz: 'Australia/Sydney', code: 'SYD' },
              ].map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-6 border-r border-white/5 last:border-0 relative group">
                  <span className="font-display text-[15px] text-white/90 font-bold tracking-[0.6em] uppercase hover:text-gold transition-all duration-500 cursor-default">{c.city}</span>
                  
                  <AnalogClock timezone={c.tz} date={tick} />
                  
                  <div className="flex flex-col items-center font-stat text-center">
                    <span className="text-[32px] text-white tracking-[0.25em] leading-none mb-1 shadow-sm mix-blend-plus-lighter">{getDestinationTime(c.tz, tick)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Persona Radar Chart (Custom SVG) */}
          <div className="lg:w-1/3 glass-dark rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-sm text-white/40 font-bold tracking-[0.3em] uppercase">Identity</h2>
              <span className="font-label text-[9px] text-aurora uppercase tracking-widest border border-aurora/30 px-2 py-0.5 rounded-full">Persona Tracker</span>
            </div>

            <div className="flex items-center justify-center relative py-4">
              {/* Radar Chart Lines */}
              <svg className="w-40 h-40 opacity-20" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="0.5" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
              </svg>

              {/* Persona Shape */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-x-0 top-0 flex flex-col items-center">
                    <span className="font-label text-[8px] text-gold uppercase mb-1">Adventure</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <div className="flex flex-col items-end">
                      <span className="font-label text-[8px] text-teal-400 uppercase mb-1 translate-x-2">Trending</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-center translate-y-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-aurora" />
                    <span className="font-label text-[8px] text-aurora uppercase mt-1">Heritage</span>
                  </div>
                  <div className="absolute inset-y-0 left-0 flex items-center translate-x-[-12px]">
                    <div className="flex flex-col items-start px-2">
                      <span className="font-label text-[8px] text-coral uppercase mb-1">Serene</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-coral" />
                    </div>
                  </div>

                  {/* The actual radar shape (Custom Polygon) */}
                  <svg className="absolute inset-0 w-full h-full fill-white/10 stroke-white/40 drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]" viewBox="0 0 100 100">
                     <polygon points={
                       userProfile?.travelStyle === 'Luxury' ? "50,20 80,50 50,70 30,50" :
                       userProfile?.travelStyle === 'Culture' ? "50,40 60,50 50,90 40,50" :
                       userProfile?.travelStyle === 'Adventure' ? "50,10 60,50 50,60 40,50" :
                       "50,30 70,50 50,70 30,50"
                     } />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
                <p className="font-editorial text-2xl text-white tracking-wide">{userProfile?.travelStyle || 'Active'} Explorer</p>
                <p className="font-body text-mist-500 text-[10px] uppercase tracking-widest mt-1">Based on Voyager Activity</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black/60 border-t border-white/10 pt-20 pb-12 w-full backdrop-blur-md">
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="font-display text-4xl font-bold tracking-[0.3em] uppercase text-white hover:text-white/90 transition-opacity">
                DESTIN<span className="text-gold">AI</span>
            </div>
            <div className="flex gap-8">
              {['Manifesto', 'Privacy', 'Support', 'Legal'].map(l => (
                  <button key={l} className="font-label text-[10px] text-white/60 hover:text-gold uppercase tracking-widest transition-all border-none bg-transparent cursor-pointer">{l}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 pt-8">
            <p className="font-label text-[9px] text-white/50 uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} DestinAI Intelligence Platform. All Rights Reserved.
            </p>
            <div className="flex items-center gap-3">
                <span className="font-stat text-[12px] text-white/50 tracking-widest">NETWORK VERSION <span className="text-white/80">12.11.0</span></span>
                <span className="w-4 h-px bg-white/10"></span>
                <span className="font-stat text-[12px] text-white/50 tracking-widest">LATENCY <span className="text-green-400">20MS</span></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
