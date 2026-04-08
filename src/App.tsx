import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HotelProvider } from './context/HotelContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

import Rooms from './pages/Rooms';
import Reservations from './pages/Reservations';

import Guests from './pages/Guests';
import Billing from './pages/Billing';
import Staff from './pages/Staff';
import Analytics from './pages/Analytics';
import CheckInOut from './pages/CheckInOut';
import Housekeeping from './pages/Housekeeping';
import Maintenance from './pages/Maintenance';

function App() {
  return (
    <HotelProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="check-in-out" element={<CheckInOut />} />
          <Route path="guests" element={<Guests />} />
          <Route path="billing" element={<Billing />} />
          <Route path="staff" element={<Staff />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="housekeeping" element={<Housekeeping />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </HotelProvider>
  );
}

export default App;
