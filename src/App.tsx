import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Planner from './pages/Planner';
import Booking from './pages/Booking';
import FloatingChat from './components/FloatingChat';
import './App.css';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global Floating AI Conversational Agent */}
        <FloatingChat />
      </div>
    </Router>
  );
}

export default App;