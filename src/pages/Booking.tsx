import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoadScript } from '@react-google-maps/api';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import InnerNavbar from '../components/InnerNavbar';
import { GOOGLE_MAPS_LIBRARIES } from '../utils/googleMapsConfig';

const PRICE_LABELS: Record<number, { label: string; cls: string }> = {
  0: { label: "Free",     cls: "chip-forest" },
  1: { label: "Budget",   cls: "chip-teal" },
  2: { label: "Moderate", cls: "chip-gold" },
  3: { label: "Premium",  cls: "chip-aurora" },
  4: { label: "Luxury",   cls: "chip-coral" },
};

const CONCIERGE_TIPS = [
  { title: "Booking Window", desc: "For the best rates, book at least 3 weeks in advance for metropolitan areas." },
  { title: "Local Insight", desc: "Boutique hotels in historic districts offer more unique experiences than chain hotels." },
  { title: "AI-Ready", desc: "Need more tailored hotel choices? Ask our AI chat below for a specific vibe or budget." },
];

const FALLBACK_HOTELS = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"
];

export default function Booking() {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [destination, setDestination] = useState("");
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [bookingCount, setBookingCount] = useState(0);

  // Date-Aware States (Default: Tomorrow -> Next Day)
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(dayAfter.toISOString().split('T')[0]);

  const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load user's recent bookings for the sidebar
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return;
      const q = collection(db, 'users', u.uid, 'bookings');
      onSnapshot(q, s => {
        setBookingCount(s.size);
        const latest = s.docs
          .sort((a: any, b: any) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0))
          .slice(0, 3);
        setRecentBookings(latest.map(d => ({ id: d.id, ...d.data() })));
      });
    });
    return () => unsub();
  }, []);

  const getPriceInfo = (level: number | undefined) =>
    level !== undefined && PRICE_LABELS[level] ? PRICE_LABELS[level] : { label: "Standard", cls: "chip-navy" };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    return Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className={`w-3 h-3 ${i < full ? 'text-gold' : 'text-white/10'}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  const searchHotels = () => {
    if (!destination.trim()) return showToast("Enter a destination first", "info");
    setLoading(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: destination }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        findNearbyHotels(results[0].geometry.location);
      } else {
        showToast("Location not found: " + status, "error");
        setLoading(false);
      }
    });
  };

  const findNearbyHotels = (location: google.maps.LatLng) => {
    const dummy = new window.google.maps.Map(document.createElement("div"));
    const svc = new window.google.maps.places.PlacesService(dummy);
    svc.nearbySearch({ location, radius: 5000, type: 'lodging' }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setHotels(results.slice(0, 12));
        showToast(`${results.slice(0, 12).length} hotels discovered ✓`, "success");
      } else {
        setHotels([]);
        showToast("No hotels found in this area", "info");
      }
      setLoading(false);
    });
  };

  const confirmBooking = async () => {
    if (!selectedHotel) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return showToast("Sign in to secure a booking", "error");
    try {
      await addDoc(collection(db, "users", uid, "bookings"), {
        hotelName: selectedHotel.name,
        address: selectedHotel.vicinity,
        rating: selectedHotel.rating || null,
        priceLevel: selectedHotel.price_level ?? null,
        status: 'confirmed',
        checkIn,
        checkOut,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "users", uid, "activities"), {
        type: 'booking_confirmed',
        icon: 'hotel',
        title: 'Hotel Booked',
        subtitle: selectedHotel.name + (selectedHotel.vicinity ? ` · ${selectedHotel.vicinity}` : ''),
        createdAt: serverTimestamp(),
      });
      showToast(`Reservation secured: ${selectedHotel.name} ✓`, "success");
      setSelectedHotel(null);
    } catch {
      showToast("Booking failed. Cloud sync error.", "error");
    }
  };

  if (loadError) return (
    <div className="min-h-screen bg-midnight flex items-center justify-center">
      <p className="font-label text-xs text-coral uppercase tracking-widest">Places module failed to load</p>
    </div>
  );
  if (!isLoaded) return (
    <div className="min-h-screen bg-midnight flex items-center justify-center">
      <div className="text-center">
        <div className="font-stat text-6xl text-teal-400/20 mb-4">FIND</div>
        <p className="font-label text-xs text-teal-400 uppercase tracking-widest animate-pulse">Initializing Concierge Engine...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-midnight selection:bg-gold/30 selection:text-midnight overflow-x-hidden">
      <InnerNavbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-6 z-[80] glass-dark px-5 py-4 rounded-xl flex items-center gap-4 shadow-dark animate-slide-in-r border-l-4 ${
          toast.type === 'success' ? 'border-l-gold' : toast.type === 'error' ? 'border-l-coral' : 'border-l-teal'
        }`}>
          <span className="font-label text-[10px] text-white uppercase tracking-widest">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-white/30 hover:text-white ml-2 border-none bg-transparent cursor-pointer text-base leading-none">×</button>
        </div>
      )}

      {selectedHotel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-fade-in overflow-y-auto">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedHotel(null)} />
          
          <div className="relative flex flex-col md:flex-row w-full max-w-5xl bg-[#0B1A2E]/90 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-white/10 animate-scale-in">
            {/* --- LEFT SECTION: VISUAL ASSET --- */}
            <div className="md:w-5/12 relative min-h-[300px] border-r border-white/5">
               <img 
                 src={selectedHotel.photos?.[0]?.getUrl({ maxWidth: 1200 }) || FALLBACK_HOTELS[0]} 
                 alt={selectedHotel.name}
                 className="absolute inset-0 w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A2E] via-[#0B1A2E]/40 to-transparent" />
               <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="glass-dark w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-gold/30">
                     <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" /></svg>
                  </div>
                  <span className="font-label text-[10px] text-gold uppercase tracking-[0.5em] block mb-2 opacity-80">Reserved Asset 0.1</span>
                  <h2 className="font-editorial text-4xl text-white leading-tight mb-2">{selectedHotel.name}</h2>
                  <p className="font-body text-white/50 text-xs leading-relaxed max-w-xs">{selectedHotel.vicinity}</p>
               </div>
            </div>

            {/* --- RIGHT SECTION: THE MANIFEST --- */}
            <div className="md:w-7/12 p-8 md:p-14 flex flex-col relative">
              <div className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors cursor-pointer" onClick={() => setSelectedHotel(null)}>
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </div>

              <div className="mb-10 flex items-center gap-4">
                 <div className="h-px bg-gold/30 flex-1"></div>
                 <span className="font-label text-[11px] text-gold uppercase tracking-[0.6em] whitespace-nowrap">Voyage Manifest Protocol</span>
                 <div className="h-px bg-gold/30 flex-1"></div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                 <div className="flex flex-col gap-1.5">
                    <span className="font-label text-[9px] text-white/20 uppercase tracking-widest">Check-in Sequence</span>
                    <div className="flex items-center gap-3">
                       <svg className="w-5 h-5 text-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       <span className="font-stat text-2xl text-white tracking-[0.1em]">{checkIn}</span>
                    </div>
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <span className="font-label text-[9px] text-white/20 uppercase tracking-widest">Check-out Sequence</span>
                    <div className="flex items-center gap-3">
                       <svg className="w-5 h-5 text-teal-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       <span className="font-stat text-2xl text-white tracking-[0.1em]">{checkOut}</span>
                    </div>
                 </div>
              </div>

              {/* Price Analytics Breakdown */}
              <div className="card-dark border border-white/5 rounded-2xl p-6 mb-10 group hover:border-gold/20 transition-all duration-500">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                         <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      </div>
                      <span className="font-display text-sm text-white font-bold tracking-wide">Reservation Analytics</span>
                   </div>
                   <span className="font-label text-[9px] text-teal-400 uppercase tracking-widest animate-pulse">Live Status: Verified</span>
                </div>
                
                <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center group/row">
                      <span className="font-label text-[10px] uppercase tracking-widest text-white/50 group-hover/row:text-gold transition-colors duration-300">Luxury Base Rate</span>
                      <span className="font-stat text-lg text-white">${((selectedHotel.price_level || 1) * 240).toLocaleString()}.00</span>
                   </div>
                   <div className="flex justify-between items-center group/row">
                      <span className="font-label text-[10px] uppercase tracking-widest text-white/50 group-hover/row:text-gold transition-colors duration-300">AI Concierge Surcharge</span>
                      <span className="font-stat text-lg text-gold">$42.00</span>
                   </div>
                   <div className="flex justify-between items-center group/row">
                      <span className="font-label text-[10px] uppercase tracking-widest text-white/30 group-hover/row:text-white transition-colors duration-300 italic">Auth Token Hash</span>
                      <span className="font-stat text-[11px] text-white/40 tracking-widest">0x{Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 mt-auto">
                 <button 
                  onClick={confirmBooking}
                  className="w-full h-16 bg-gold text-midnight font-display font-bold text-sm uppercase tracking-[0.4em] rounded-2xl hover:bg-white hover:text-midnight transition-all duration-500 shadow-[0_10px_30px_rgba(255,183,64,0.3)] cursor-pointer"
                 >
                   Confirm Reservation
                 </button>
                 <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/5 border border-teal-500/10">
                       <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                       <span className="font-label text-[8px] text-teal-400 uppercase tracking-widest leading-none mt-0.5">Secure Transaction Protocol Active</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pt-28 pb-24 w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-8 animate-fade-up">
          <div className="flex-1">
            <span className="font-label text-[10px] text-gold uppercase tracking-[0.4em] block mb-2">Concierge Services</span>
            <h1 className="font-display text-4xl md:text-5xl text-white font-bold tracking-wide">
              Hotel <span className="text-gradient-gold">Finder</span>
            </h1>
          </div>

          {/* Live stats */}
          <div className="flex gap-3 shrink-0">
            <div className="glass-dark rounded-xl px-4 py-3 text-center min-w-[72px]">
              <div className="font-stat text-2xl text-gold leading-none mb-0.5">{hotels.length}</div>
              <div className="font-label text-[9px] text-white/30 uppercase tracking-widest">Found</div>
            </div>
            <div className="glass-dark rounded-xl px-4 py-3 text-center min-w-[72px]">
              <div className="font-stat text-2xl text-teal-400 leading-none mb-0.5">{bookingCount}</div>
              <div className="font-label text-[9px] text-white/30 uppercase tracking-widest">Booked</div>
            </div>
          </div>
        </div>

        {/* ── Search Row ── */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-10 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Where do you want to stay? (e.g. London, Goa...)"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchHotels()}
              className="w-full h-full pl-12 pr-5 py-4 glass-dark rounded-2xl text-sm text-white placeholder:text-white/20 font-body focus:outline-none focus:border-gold transition-all border border-white/5"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 min-w-[140px]">
              <span className="absolute left-4 top-2 text-[8px] font-label text-gold uppercase tracking-[0.2em] pointer-events-none z-10">Check In</span>
              <input
                type="date"
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                className="w-full h-full pl-4 pr-3 pt-6 pb-2 glass-dark rounded-2xl text-[14px] text-white font-stat focus:outline-none focus:border-gold transition-all border border-white/5 appearance-none"
              />
            </div>
            <div className="relative flex-1 min-w-[140px]">
              <span className="absolute left-4 top-2 text-[8px] font-label text-gold uppercase tracking-[0.2em] pointer-events-none z-10">Check Out</span>
              <input
                type="date"
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full h-full pl-4 pr-3 pt-6 pb-2 glass-dark rounded-2xl text-[14px] text-white font-stat focus:outline-none focus:border-gold transition-all border border-white/5 appearance-none"
              />
            </div>
          </div>
          <button 
            onClick={searchHotels} 
            disabled={loading} 
            className="btn-primary rounded-2xl px-10 h-full whitespace-nowrap min-w-[160px]"
          >
            {loading ? 'Searching...' : 'Explore Hotels'}
          </button>
        </div>

        {/* ── Grid Layout: Sidebar + Main ── */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* SIDEBAR (Concierge Insights) */}
          <aside className="lg:col-span-4 flex flex-col gap-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Voyager Status Section */}
            <div className="card-dark rounded-3xl p-6 border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold/10 rounded-full blur-2xl group-hover:bg-gold/20 transition-all duration-700" />
               <h3 className="font-display text-sm text-white font-bold tracking-wide mb-4">Voyager Status</h3>
               <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                     <span className="font-stat text-4xl text-gold leading-none">{bookingCount || 0}</span>
                     <span className="font-label text-[9px] text-white/30 uppercase tracking-widest mt-2">Active Stays</span>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="chip-gold text-[8px] py-1 px-3 mb-1">ELITE MEMBER</div>
                     <span className="font-label text-[8px] text-teal-400 uppercase tracking-tighter">Sync: 12ms</span>
                  </div>
               </div>
            </div>

            {/* Tips Section */}
            <div className="card-dark rounded-3xl p-6 border border-white/5">
              <h3 className="font-display text-base text-white font-bold tracking-wide mb-5 flex items-center gap-3">
                <span className="w-4 h-px bg-gold" /> Concierge Insights
              </h3>
              <div className="flex flex-col gap-5">
                {CONCIERGE_TIPS.map((tip, i) => (
                  <div key={i} className="group cursor-default">
                    <p className="font-label text-[9px] text-gold uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">{tip.title}</p>
                    <p className="font-body text-mist-500 text-xs leading-relaxed">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Bookings Sidebar widget */}
            {recentBookings.length > 0 && (
              <div className="card-dark rounded-3xl p-6 border border-white/5">
                <h3 className="font-display text-base text-white font-bold tracking-wide mb-5">Recent Stays</h3>
                <div className="flex flex-col gap-3">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="glass-dark p-3.5 rounded-xl animate-scale-in">
                      <h4 className="font-display text-xs text-white font-semibold mb-0.5 truncate">{b.hotelName}</h4>
                      <p className="font-body text-mist-500 text-[10px] truncate">{b.address}</p>
                      <div className="flex items-center justify-between mt-2">
                         <span className="font-label text-[8px] text-white/20 uppercase tracking-widest">{b.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}</span>
                         <span className="chip-teal text-[8px] py-0 px-2 h-4 flex items-center">CONFIRMED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="glass-teal rounded-3xl p-6">
              <h4 className="font-display text-sm text-teal-400 font-bold mb-2">Secure Transactions</h4>
              <p className="font-body text-teal-900/60 text-xs leading-relaxed">Every booking made on DestinAI is encrypted and synced with your global travel profile in real-time.</p>
            </div>
          </aside>

          {/* MAIN GRID */}
          <div className="lg:col-span-8 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            {hotels.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {hotels.map((hotel, i) => {
                   const priceInfo = getPriceInfo(hotel.price_level);
                   const fallbackImg = FALLBACK_HOTELS[i % FALLBACK_HOTELS.length];
                   const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + hotel.vicinity)}&query_place_id=${hotel.place_id}`;

                   return (
                     <div 
                      key={i} 
                      className="group card-dark rounded-3xl overflow-hidden hover:border-gold/30 hover:shadow-gold transition-all duration-300 animate-fade-up flex flex-col"
                      onClick={() => setSelectedHotel(hotel)}
                      style={{ animationDelay: `${i * 0.04}s` }}
                     >
                       {/* Image with overlay stats */}
                       <div className="relative h-44 overflow-hidden bg-midnight-700 shrink-0">
                         <img 
                            src={hotel.photos?.[0]?.getUrl({ maxWidth: 800 }) || fallbackImg} 
                            alt={hotel.name}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${!hotel.photos?.[0] ? 'opacity-40 grayscale-[0.5]' : ''}`}
                         />
                         <div className="absolute inset-0 bg-overlay-dark" />
                         
                         {/* Rating pill */}
                         {hotel.rating && (
                           <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                             <div className="glass-dark px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/5">
                               <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                               <span className="font-stat text-white text-xs">{hotel.rating}</span>
                             </div>
                             
                             <div className="glass-dark px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-white/10 animate-pulse">
                               <span className="w-1 h-1 rounded-full bg-teal-400" />
                               <span className="font-stat text-[7px] text-white/90 uppercase tracking-widest">Trending</span>
                             </div>
                           </div>
                         )}
                         
                         <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                            <span className={priceInfo.cls}>{priceInfo.label}</span>
                            {hotel.price_level >= 3 && (
                               <span className="chip-coral text-[7px] py-0.5 px-2 h-auto flex items-center tracking-tighter animate-bounce">LIMITED</span>
                            )}
                         </div>

                         {/* Maps Link Overlay */}
                         <a 
                            href={mapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full glass-dark border border-white/10 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/30 transition-all z-20 group/map"
                            title="Verify on Google Maps"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         </a>
                       </div>
                       
                       {/* Card Body */}
                       <div className="p-5 flex flex-col items-start flex-1 min-h-[140px]">
                         <h3 className="font-display text-base text-white font-bold tracking-wide line-clamp-1 mb-1">{hotel.name}</h3>
                         <p className="font-body text-mist-500 text-xs leading-relaxed line-clamp-2 flex-1">{hotel.vicinity}</p>
                         
                         <div className="w-full flex items-center justify-between mt-4">
                            <div className="flex items-center gap-1">
                               {renderStars(hotel.rating || 0)}
                            </div>
                            <button 
                             onClick={(e) => { e.stopPropagation(); setSelectedHotel(hotel); }}
                             className="font-label text-[10px] text-gold uppercase tracking-widest hover:translate-x-1 transition-all flex items-center gap-1.5 border-none bg-transparent cursor-pointer"
                            >
                              Reserve <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                         </div>
                       </div>
                     </div>
                   );
                })}
              </div>
            ) : !loading ? (
              <div className="flex flex-col items-center justify-center py-32 glass-dark rounded-3xl text-center border border-white/5 border-dashed">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                   <svg className="w-8 h-8 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" /></svg>
                </div>
                <p className="font-label text-[10px] text-white/20 uppercase tracking-[0.4em] mb-2">Ready for discovery</p>
                <p className="font-body text-mist-500 text-xs max-w-xs">{destination ? "We couldn't find matches in that area. Try nearby cities." : "Enter a destination in the finder above to explore premium local stays."}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1,2,3,4].map((idx) => (
                  <div key={idx} className="card-dark h-[320px] rounded-3xl animate-pulse" />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <footer className="bg-black/60 border-t border-white/10 pt-24 pb-12 w-full backdrop-blur-md mt-20">
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-20">
            <div className="flex flex-col gap-6">
               <div onClick={() => navigate('/home')} className="font-display text-5xl font-bold tracking-[0.4em] uppercase text-white hover:text-gold transition-all cursor-pointer group">
                  DESTIN<span className="text-gold group-hover:text-white transition-colors">AI</span>
               </div>
               <button onClick={() => navigate('/home')} className="flex items-center gap-3 group border-none bg-transparent cursor-pointer">
                  <svg className="w-5 h-5 text-white/20 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  <span className="font-label text-[11px] text-white/40 group-hover:text-white uppercase tracking-[0.2em] transition-colors">Return to Dashboard</span>
               </button>
            </div>

            {/* System Intelligence Row */}
            <div className="flex flex-wrap gap-6 items-center">
               <div className="flex flex-col gap-4 text-right">
                  <div className="flex items-center gap-4 px-4 py-2 rounded-2xl border border-teal-500/20 bg-teal-500/5 backdrop-blur-sm group hover:border-teal-500/40 transition-all">
                     <span className="w-2h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                     <span className="font-label text-[10px] text-teal-400 uppercase tracking-[0.3em]">Concierge Engine: Optimized v4.2</span>
                  </div>
                  <div className="flex items-center gap-4 px-4 py-2 rounded-2xl border border-gold/20 bg-gold/5 backdrop-blur-sm group hover:border-gold/40 transition-all">
                     <span className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_10px_rgba(255,183,64,0.5)]" />
                     <span className="font-label text-[10px] text-gold uppercase tracking-[0.3em]">Global Sync: Latency 14ms</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-10">
            <div className="flex flex-col gap-2">
                <p className="font-label text-[10px] text-white/50 uppercase tracking-[0.4em]">© {new Date().getFullYear()} DestinAI Concierge Platform</p>
                <div className="flex gap-4">
                    <span className="font-label text-[8px] text-white/20 uppercase hover:text-gold transition-colors cursor-pointer">Privacy Protocol</span>
                    <span className="font-label text-[8px] text-white/20 uppercase hover:text-gold transition-colors cursor-pointer">Luxury Ethics</span>
                    <span className="font-label text-[8px] text-white/20 uppercase hover:text-gold transition-colors cursor-pointer">Booking Service Agreement</span>
                </div>
            </div>
            <div className="flex items-center gap-5">
                <div className="flex flex-col items-end">
                    <span className="font-stat text-[14px] text-white/50 tracking-widest leading-none">RESERVATION HUB v1.8</span>
                    <span className="font-stat text-[10px] text-gold/30 tracking-widest mt-1">STATUS: FULL-SYNC ACTIVE</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
