import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoadScript } from '@react-google-maps/api';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getRecommendation, getNavigationAdvice } from '../services/aiAgents';
import InnerNavbar from '../components/InnerNavbar';
import { GOOGLE_MAPS_LIBRARIES } from '../utils/googleMapsConfig';

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0B1A2E" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0B1A2E" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8BAABF" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#FFB740" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1A3A5C" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#122133" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#5A7FA0" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1A3A5C" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#070F1A" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#2A5280" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];

const TRAVEL_MODES = [
  { id: 'DRIVING', label: 'Drive', icon: 'M8 17l-4-4m0 0l4-4m-4 4h12m-8 4v1a3 3 0 003 3h4a3 3 0 003-3v-1m0-8V7a3 3 0 00-3-3h-4a3 3 0 00-3 3v2' },
  { id: 'WALKING', label: 'Walk', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'TRANSIT', label: 'Transit', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'FLIGHT', label: 'Flight', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
];

const PROMPT_SUGGESTIONS = [
  { label: 'Goa Weekend', query: 'Goa, Dudhsagar Falls, Anjuna Beach' },
  { label: 'Paris Classic', query: 'Eiffel Tower, Louvre, Montmartre' },
  { label: 'Kerala Odyssey', query: 'Munnar, Alleppey, Kovalam' },
  { label: 'Tokyo Explorer', query: 'Shinjuku, Shibuya, Asakusa' },
];

export default function Planner() {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [planText, setPlanText] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [travelMode, setTravelMode] = useState<string>('DRIVING');
  const [routeStats, setRouteStats] = useState<{ distance: number; duration: number; error: string | null }>({ distance: 0, duration: 0, error: null });
  const [travelMethod, setTravelMethod] = useState('road'); // road, flight, rail, sea
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [savedTrips, setSavedTrips] = useState<any[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const flightPolyline = useRef<google.maps.Polyline | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load saved trips from Firestore for reference panel
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return;
      const q = collection(db, 'users', u.uid, 'trips');
      onSnapshot(q, s => {
        setSavedCount(s.size);
        const latest = s.docs.sort((a:any, b:any) => b.data().createdAt?.seconds - a.data().createdAt?.seconds).slice(0, 3);
        setSavedTrips(latest.map(d => ({ id: d.id, ...d.data() })));
      });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const initMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5,
      styles: DARK_MAP_STYLE,
      disableDefaultUI: true,
      zoomControl: true,
    });
    setMap(initMap);

    directionsService.current = new window.google.maps.DirectionsService();
    directionsRenderer.current = new window.google.maps.DirectionsRenderer({
      map: initMap,
      polylineOptions: { strokeColor: "#FFB740", strokeOpacity: 0.85, strokeWeight: 4 },
      suppressMarkers: false,
    });

    const searchPlaceFree = async (query: string) => {
      if (!query.trim()) return;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          const location = { name: data[0].display_name.split(',')[0], lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          setPlaces(prev => {
            if (prev.length >= 6) { showToast("Maximum 6 waypoints allowed", "error"); return prev; }
            const marker = new window.google.maps.Marker({
              position: { lat: location.lat, lng: location.lng }, map: map, title: location.name,
              icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: "#FFB740", fillOpacity: 1, strokeWeight: 2, strokeColor: "#0B1A2E" }
            });
            markersRef.current.push(marker);
            return [...prev, location];
          });
          if (inputRef.current) inputRef.current.value = "";
          showToast("Stop added ✓", "success");
        } else {
          showToast("Location not found", "error");
        }
      } catch {
        showToast("Search engine error", "error");
      }
    };

    if (inputRef.current) {
      inputRef.current.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          searchPlaceFree((e.target as HTMLInputElement).value);
        }
      };
    }

    const saved = localStorage.getItem("tripPlan");
    if (saved) {
      const parsed = JSON.parse(saved);
      setPlaces(parsed);
      parsed.forEach((p: any) => {
        const marker = new window.google.maps.Marker({
          position: { lat: p.lat, lng: p.lng }, map: initMap, title: p.name,
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: "#FFB740", fillOpacity: 1, strokeWeight: 2, strokeColor: "#0B1A2E" }
        });
        markersRef.current.push(marker);
      });
    }
  }, [isLoaded, map]);

  // Auto-Update Telemetry when stops change
  useEffect(() => {
    if (map && places.length >= 2) {
      drawRoute(true);
    } else if (places.length < 2) {
      setRouteStats({ distance: 0, duration: 0, error: null });
    }
  }, [places, travelMethod, map]);

  const removePlace = (idx: number) => {
    markersRef.current[idx]?.setMap(null);
    markersRef.current.splice(idx, 1);
    setPlaces(prev => prev.filter((_, i) => i !== idx));
    showToast("Stop removed", "info");
  };

  const aiSuggest = async () => {
    if (!places.length) return showToast("Add at least one destination", "info");
    setLoadingAI(true);
    try {
      const result = await getRecommendation(places.map(p => p.name).join(", "));
      setPlanText(result);
      showToast("AI suggestions ready ✓", "success");
    } catch { showToast("AI agent offline", "error"); }
    finally { setLoadingAI(false); }
  };

  // --- Telemetry Helpers ---
  const calculateManualStats = () => {
    let totalD = 0;
    for (let i = 0; i < places.length - 1; i++) {
        const p1 = places[i], p2 = places[i+1];
        const R = 6371; // Earth radius in KM
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLon = (p2.lng - p1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        totalD += R * c;
    }
    
    // Manual speed estimates to bypass paid Directions API
    let avgSpeedKmh = 60; // default for road
    if (travelMethod === 'flight') avgSpeedKmh = 800;
    if (travelMethod === 'rail') avgSpeedKmh = 100;
    if (travelMethod === 'sea') avgSpeedKmh = 30;
    
    const durationSeconds = (totalD / avgSpeedKmh) * 3600;
    return { distance: totalD, duration: durationSeconds };
  };

  const formatDuration = (s: number) => {
    if (!s) return "0H 0M";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}H ${m}M`;
  };

  const drawRoute = (silent: boolean = false) => {
    if (places.length < 2) return;
    if (!map) return;
    
    // Clear previous paths
    if (flightPolyline.current) flightPolyline.current.setMap(null);
    if (directionsRenderer.current) directionsRenderer.current.setDirections({ routes: [] } as any);

    const stats = calculateManualStats();
    setRouteStats({ ...stats, error: null });
    
    const path = places.map(p => ({ lat: p.lat, lng: p.lng }));
    
    // Define path style based on travel method
    let polyStyle: google.maps.PolylineOptions = {
      path,
      geodesic: true,
      strokeColor: "#FFB740",
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: map
    };

    if (travelMethod === "flight") {
      polyStyle.strokeWeight = 3;
      polyStyle.icons = [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 2 }, offset: "0", repeat: "10px" }];
    } else if (travelMethod === "rail") {
      polyStyle.strokeColor = "#2DD4BF"; // Teal for rail
    }

    flightPolyline.current = new window.google.maps.Polyline(polyStyle);
    
    const bounds = new window.google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    if (map) map.fitBounds(bounds);
    
    if (!silent) {
       const msg = travelMethod.charAt(0).toUpperCase() + travelMethod.slice(1) + " route mapped ✓";
       showToast(msg, "success");
    }
  };

  const saveTrip = async () => {
    if (!places.length) return showToast("Nothing to save", "error");
    localStorage.setItem("tripPlan", JSON.stringify(places));
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return showToast("Sign in to sync to cloud", "error");
      await addDoc(collection(db, "users", uid, "trips"), { places, planText, travelMethod, createdAt: serverTimestamp() });
      await addDoc(collection(db, "users", uid, "activities"), {
        type: 'trip_saved',
        icon: 'map',
        title: 'Trip Saved',
        subtitle: places.map(p => p.name).join(' → '),
        createdAt: serverTimestamp(),
      });
      showToast("Trip synced to cloud ✓", "success");
    } catch { showToast("Saved locally. Cloud sync failed.", "error"); }
  };

  const clearTrip = () => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    directionsRenderer.current?.setDirections({ routes: [] } as any);
    setPlaces([]); setPlanText("");
    localStorage.removeItem("tripPlan");
    showToast("Workspace cleared", "info");
  };

  const generateItinerary = async () => {
    if (!places.length) return showToast("Add destinations first", "info");
    setLoadingAI(true);
    showToast("Generating itinerary...", "info");
    try {
      const plan = await getNavigationAdvice(places.map(p => p.name).join(" → "), travelMethod);
      setPlanText(plan);
      const uid = auth.currentUser?.uid;
      if (uid) {
        await addDoc(collection(db, "users", uid, "activities"), {
          type: 'plan_generated',
          icon: 'ai',
          title: 'AI Itinerary Generated',
          subtitle: places.map(p => p.name).join(' → '),
          createdAt: serverTimestamp(),
        });
      }
      showToast("Itinerary ready ✓", "success");
    } catch { showToast("Generation failed. Try again.", "error"); }
    finally { setLoadingAI(false); }
  };

  const loadSavedTrip = (trip: any) => {
    clearTrip();
    if (!map) return;
    const loaded = trip.places || [];
    setPlaces(loaded);
    loaded.forEach((p: any) => {
      const marker = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng }, map, title: p.name,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: "#FFB740", fillOpacity: 1, strokeWeight: 2, strokeColor: "#0B1A2E" }
      });
      markersRef.current.push(marker);
    });
    if (trip.planText) setPlanText(trip.planText);
    showToast(`Loaded: ${loaded.map((p: any) => p.name).join(' → ')}`, "success");
  };

  const copyShareLink = () => {
    if (!places.length) return showToast("No route to share", "error");
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    showToast("Share link copied to clipboard ✓", "success");
  };

  const exportPlanJSON = () => {
    if (!places.length) return showToast("No data to export", "error");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ places, planText, travelMethod, timestamp: new Date() }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `DestinAI_Route_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast("Route exported as JSON ✓", "success");
  };

  if (loadError) return (
    <div className="min-h-screen bg-midnight flex items-center justify-center">
      <p className="font-label text-xs text-coral uppercase tracking-widest">Maps module failed to load</p>
    </div>
  );
  if (!isLoaded) return (
    <div className="min-h-screen bg-midnight flex items-center justify-center">
      <div className="text-center">
        <div className="font-stat text-6xl text-gold/20 mb-4">MAP</div>
        <p className="font-label text-xs text-teal-400 uppercase tracking-widest animate-pulse">Initializing Maps Engine...</p>
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

      <main className="pt-28 pb-24 w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-8 animate-fade-up">
          <div className="flex-1">
            <span className="font-label text-[10px] text-gold uppercase tracking-[0.4em] block mb-2">AI Command Center</span>
            <h1 className="font-display text-4xl md:text-5xl text-white font-bold tracking-wide">
              Travel <span className="text-gradient-gold">Planner</span>
            </h1>
          </div>

          {/* Live stats */}
          <div className="flex gap-3 shrink-0">
            <div className="glass-dark rounded-xl px-4 py-3 text-center min-w-[72px]">
              <div className="font-stat text-2xl text-gold leading-none mb-0.5">{places.length}</div>
              <div className="font-label text-[9px] text-white/30 uppercase tracking-widest">Stops</div>
            </div>
            <div className="glass-dark rounded-xl px-4 py-3 text-center min-w-[72px]">
              <div className="font-stat text-2xl text-teal-400 leading-none mb-0.5">{savedCount}</div>
              <div className="font-label text-[9px] text-white/30 uppercase tracking-widest">Saved</div>
            </div>
          </div>
        </div>

        {/* ── Search + Transport Mode Row ── */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search & add a destination stop..."
              className="w-full h-full pl-11 pr-5 py-3.5 glass-dark rounded-2xl text-sm text-white placeholder:text-white/20 font-body focus:outline-none focus:border-gold transition-all"
            />
          </div>

          {/* Travel Mode — flat inline chips */}
          <div className="flex gap-2">
            {TRAVEL_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setTravelMode(mode.id as any)}
                title={mode.label}
                className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl font-label text-[10px] uppercase tracking-widest transition-all duration-200 cursor-pointer border whitespace-nowrap ${
                  travelMode === mode.id
                    ? 'bg-gold text-midnight border-gold'
                    : 'glass-dark text-white/40 hover:text-white hover:border-white/20'
                }`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={mode.icon} />
                </svg>
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Map ── */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-dark mb-8 animate-fade-up" style={{ height: '440px', animationDelay: '0.1s' }}>
          <div ref={mapRef} className="w-full h-full" />

          {/* Map overlay: empty state hint */}
          {places.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="glass-dark rounded-2xl px-6 py-4 text-center">
                <p className="font-label text-[10px] text-white/30 uppercase tracking-widest">Search a destination above to drop a pin</p>
              </div>
            </div>
          )}

          {/* Map overlay: stop counter */}
          {places.length > 0 && (
            <div className="absolute top-4 left-4 glass-dark px-4 py-2 rounded-xl">
              <span className="font-label text-[10px] text-gold uppercase tracking-widest">{places.length} stop{places.length > 1 ? 's' : ''} plotted</span>
            </div>
          )}
        </div>

        {/* ── Bottom Grid: 3 columns ── */}
        <div className="grid lg:grid-cols-12 gap-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>

          {/* LEFT: Route Manager */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* LIVE: Route Summary Analytics */}
            <div className="card-dark rounded-2xl p-5 border border-white/5 group hover:border-gold/30 transition-all">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div>
                   <h3 className="font-display text-sm text-white font-bold tracking-wide">Route Analytics</h3>
                   <span className="font-label text-[8px] text-white/30 uppercase tracking-[0.2em]">{places.length} active stops</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="glass-dark rounded-xl p-3 flex flex-col">
                  <span className="font-label text-[8px] text-white/20 uppercase tracking-widest mb-1.5">Total distance</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-stat text-lg text-white">{routeStats.error ? "N/A" : routeStats.distance.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                    <span className="font-stat text-[8px] text-gold/60">KM</span>
                  </div>
                </div>
                <div className="glass-dark rounded-xl p-3 flex flex-col">
                  <span className="font-label text-[8px] text-white/20 uppercase tracking-widest mb-1.5">Travel time</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-stat text-lg text-teal-400">{routeStats.error ? "NOT POSSIBLE" : formatDuration(routeStats.duration)}</span>
                    <span className="font-stat text-[8px] text-teal-400/30">LATEST TELEMETRY</span>
                  </div>
                </div>
              </div>

              <div className="glass-teal rounded-xl px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                   <span className="font-label text-[8px] text-teal-400 uppercase tracking-widest">Live Eco Score</span>
                </div>
                <span className="font-stat text-[10px] text-teal-400">+{places.length * 12} pts</span>
              </div>
            </div>

            {/* Travel Method Selection */}
            <div className="card-dark rounded-2xl p-5 mb-4">
              <span className="block text-[10px] font-label text-gold uppercase tracking-[0.2em] mb-4">Select Trip Category</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'flight', label: 'Flight', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
                  { id: 'road', label: 'Road Trip', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1' },
                  { id: 'rail', label: 'Railroad', icon: 'M5 13l4 4L19 7' },
                  { id: 'sea', label: 'Cruise', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9' }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setTravelMethod(method.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      travelMethod === method.id 
                        ? 'bg-gold/10 border-gold/50 text-gold shadow-lg shadow-gold/5' 
                        : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:border-white/10 hover:text-white/60'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={method.icon} />
                    </svg>
                    <span className="text-[9px] font-bold uppercase tracking-wider">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stops Panel */}
            <div className="card-dark rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base text-white font-bold tracking-wide">Route Stops</h3>
                {places.length > 0 && (
                  <button onClick={clearTrip} className="font-label text-[9px] text-coral/50 uppercase tracking-widest hover:text-coral transition-colors border-none bg-transparent cursor-pointer">
                    Clear all
                  </button>
                )}
              </div>

              {places.length === 0 ? (
                <p className="font-body text-white/20 text-xs py-4 text-center">No stops added yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {places.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 glass-dark rounded-xl px-3 py-2.5 group animate-scale-in">
                      <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                        <span className="font-stat text-gold text-[11px]">{i + 1}</span>
                      </div>
                      <span className="font-body text-white/80 text-xs flex-1 truncate">{p.name}</span>
                      <button
                        onClick={() => removePlace(i)}
                        className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-coral transition-colors opacity-0 group-hover:opacity-100 border-none bg-transparent cursor-pointer"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="card-dark rounded-2xl p-5">
              <h3 className="font-display text-base text-white font-bold tracking-wide mb-4">Actions</h3>
              <div className="flex flex-col gap-2">
                <button onClick={aiSuggest} disabled={loadingAI} className="w-full flex items-center gap-3 px-4 py-3 glass-dark rounded-xl hover:border-gold/40 transition-all group disabled:opacity-40 cursor-pointer">
                  <svg className="w-4 h-4 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  <span className="font-label text-[10px] text-white/60 uppercase tracking-widest group-hover:text-gold transition-colors">AI Suggest</span>
                </button>
                <button onClick={() => drawRoute()} className="w-full flex items-center gap-3 px-4 py-3 glass-dark rounded-xl hover:border-teal/40 transition-all group cursor-pointer">
                  <svg className="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                  <span className="font-label text-[10px] text-white/60 uppercase tracking-widest group-hover:text-teal-400 transition-colors">Draw Route</span>
                </button>
                <button onClick={generateItinerary} disabled={loadingAI} className="w-full flex items-center gap-3 px-4 py-3 glass-dark rounded-xl hover:border-gold/40 transition-all group disabled:opacity-40 cursor-pointer">
                  <svg className="w-4 h-4 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <span className="font-label text-[10px] text-white/60 uppercase tracking-widest group-hover:text-gold transition-colors">Generate Itinerary</span>
                </button>
                <button onClick={saveTrip} className="w-full flex items-center gap-3 px-4 py-3 glass-dark rounded-xl hover:border-teal/40 transition-all group cursor-pointer">
                  <svg className="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span className="font-label text-[10px] text-white/60 uppercase tracking-widest group-hover:text-teal-400 transition-colors">Save to Cloud</span>
                </button>
              </div>
            </div>

            {/* Saved trips reference */}
            {savedTrips.length > 0 && (
              <div className="card-dark rounded-2xl p-5">
                <h3 className="font-display text-base text-white font-bold tracking-wide mb-3">Recent Trips</h3>
                <div className="flex flex-col gap-2">
                  {savedTrips.map((t: any, i) => (
                    <button
                      key={t.id}
                      onClick={() => loadSavedTrip(t)}
                      className="w-full text-left flex items-center gap-3 p-3 glass-dark rounded-xl hover:border-gold/30 transition-all group cursor-pointer"
                    >
                      <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <span className="font-stat text-gold text-[9px]">{i + 1}</span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-body text-white/60 text-xs truncate group-hover:text-white transition-colors">
                          {t.places?.map((p: any) => p.name).join(' → ') || 'Unnamed trip'}
                        </p>
                      </div>
                      <svg className="w-3 h-3 text-white/20 group-hover:text-gold transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE + RIGHT: AI Panel (spans 8 cols) */}
          <div className="lg:col-span-8">
            <div className="card-dark rounded-2xl p-6 h-full min-h-[400px] flex flex-col">

              {/* Panel header */}
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/5">
                <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display text-lg text-white font-bold tracking-wide">AI Navigation Advisor</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${loadingAI ? 'bg-gold animate-pulse' : 'bg-teal-500 animate-pulse'}`}></span>
                    <span className="font-label text-[9px] text-teal-400 uppercase tracking-widest">
                      {loadingAI ? 'Processing...' : 'Intelligence Active'}
                    </span>
                  </div>
                </div>
                {loadingAI && (
                  <div className="ml-auto flex gap-1.5">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <span key={i} className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: `${d}s` }}></span>
                    ))}
                  </div>
                )}
              </div>

              {/* Plan output */}
              {planText ? (
                <div className="flex-1 flex flex-col gap-4">
                  <div className="glass-dark rounded-2xl p-5 flex-1 overflow-y-auto max-h-72">
                    <p className="font-body text-mist-500 text-sm leading-relaxed whitespace-pre-line">{planText}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={generateItinerary} disabled={loadingAI} className="btn-primary btn-sm rounded-xl flex-1 justify-center">
                      Regenerate Plan
                    </button>
                    <button onClick={() => setPlanText('')} className="btn-ghost btn-sm rounded-xl px-4">
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center">
                  {/* Empty state: prompt suggestions */}
                  <div className="text-center mb-8">
                    <p className="font-label text-[10px] text-white/20 uppercase tracking-[0.25em] mb-6">
                      {places.length > 0
                        ? `${places.length} stop${places.length > 1 ? 's' : ''} ready — generate your AI itinerary`
                        : 'Try a quick destination to get started'}
                    </p>

                    {places.length > 0 ? (
                      <button onClick={generateItinerary} disabled={loadingAI} className="btn-primary rounded-xl px-8">
                        Generate Full Itinerary
                      </button>
                    ) : (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {PROMPT_SUGGESTIONS.map((s, i) => (
                          <button
                            key={i}
                            className="chip-gold cursor-pointer hover:bg-gold/30 transition-colors border-none"
                            onClick={() => {
                              if (inputRef.current) {
                                inputRef.current.value = s.query;
                                inputRef.current.focus();
                              }
                            }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* How to use guide */}
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { step: '01', title: 'Add Stops', desc: 'Search destinations and add up to 6 stops to your route', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                      { step: '02', title: 'Draw Route', desc: 'Visualize your route on the map with your chosen travel mode', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618' },
                      { step: '03', title: 'Generate Plan', desc: 'AI creates a step-by-step itinerary with timing and tips', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                    ].map((s) => (
                      <div key={s.step} className="glass-dark rounded-xl p-4 text-center">
                        <div className="font-stat text-3xl text-gold/20 mb-2">{s.step}</div>
                        <h4 className="font-display text-sm text-white font-bold mb-1">{s.title}</h4>
                        <p className="font-body text-white/30 text-xs leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-black/60 border-t border-white/10 pt-20 pb-12 w-full backdrop-blur-md">
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
            <div className="flex flex-col gap-6">
               <div onClick={() => navigate('/home')} className="font-display text-4xl font-bold tracking-[0.3em] uppercase text-white hover:text-gold transition-all cursor-pointer group">
                  DESTIN<span className="text-gold group-hover:text-white transition-colors">AI</span>
               </div>
               <button onClick={() => navigate('/home')} className="flex items-center gap-2 group border-none bg-transparent cursor-pointer">
                  <svg className="w-4 h-4 text-white/20 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  <span className="font-label text-[10px] text-white/40 group-hover:text-white uppercase tracking-widest transition-colors">Return to Dashboard</span>
               </button>
            </div>

            {/* Utility Actions */}
            <div className="flex flex-wrap gap-4 items-center">
               <div className="flex gap-2 mr-4 border-r border-white/10 pr-6">
                  {[
                    { label: 'Export JSON', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', action: exportPlanJSON },
                    { label: 'Share Route', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', action: copyShareLink },
                    { label: 'Save PDF', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', action: () => showToast("PDF Generation coming soon", "info") },
                  ].map(u => (
                    <button key={u.label} onClick={u.action} className="glass-dark px-4 py-2.5 rounded-xl border border-white/5 hover:border-gold/40 hover:bg-gold/5 transition-all flex items-center gap-3 cursor-pointer group">
                       <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={u.icon} /></svg>
                       <span className="font-label text-[9px] text-white/40 group-hover:text-white uppercase tracking-widest">{u.label}</span>
                    </button>
                  ))}
               </div>
               
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5">
                     <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                     <span className="font-label text-[9px] text-teal-400 uppercase tracking-widest">AI Engine: Fully Integrated</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-right">
                     <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(255,183,64,0.6)]" />
                     <span className="font-label text-[9px] text-gold uppercase tracking-widest ml-auto">Cloud Sync: Real-Time Active</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 pt-8">
            <p className="font-label text-[9px] text-white/40 uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} DestinAI Intelligence Platform. All Rights Reserved.
            </p>
            <div className="flex items-center gap-3">
                <span className="font-stat text-[12px] text-white/50 tracking-widest">MAPS ENGINE v4.12.0</span>
                <span className="w-4 h-px bg-white/10"></span>
                <span className="font-stat text-[12px] text-white/50 tracking-widest">UI SCALE 1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
