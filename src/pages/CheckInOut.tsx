import { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import ReservationModal from '../components/ui/ReservationModal';
import CheckInModal from '../components/ui/CheckInModal';
import CheckOutModal from '../components/ui/CheckOutModal';
import { Search, LogIn, Users, LogOut, Clock, AlertTriangle, CheckCircle, UserCheck, Eye } from 'lucide-react';
import { formatDateV2, getAvatarColor, getInitials } from '../utils/formatters';
import './CheckInOut.css';
import '../styles/modules.css';

const TODAY = '2026-04-08';

const STATUS_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  'Confirmed':   { bg: '#EEF2FF', color: '#4F46E5', dot: '#4F46E5' },
  'Pending':     { bg: '#FFFBEB', color: '#D97706', dot: '#D97706' },
  'Checked-in':  { bg: '#ECFDF5', color: '#059669', dot: '#059669' },
  'Checked-out': { bg: '#F0F1F5', color: '#6B6F80', dot: '#6B6F80' },
};

type Res = { id: string; guest: string; room: string; checkin: string; checkout: string; total: number; status: string; paymentStatus: string; };

const CheckInOut = () => {
  const { reservations: RESERVATIONS, checkIn, checkOut } = useHotel();
  const [tab, setTab] = useState<'arrivals' | 'inhouse' | 'departures' | 'history'>('arrivals');
  const [search, setSearch] = useState('');
  const [selectedRes, setSelectedRes] = useState<Res | null>(null);
  const [checkInRes, setCheckInRes] = useState<Res | null>(null);
  const [checkOutRes, setCheckOutRes] = useState<Res | null>(null);

  const arrivals = useMemo(() => RESERVATIONS.filter(r =>
    (r.status === 'Confirmed' || r.status === 'Pending') && r.checkin >= TODAY
  ), [RESERVATIONS]);
  const inhouse = useMemo(() => RESERVATIONS.filter(r => r.status === 'Checked-in'), [RESERVATIONS]);
  const departures = useMemo(() => RESERVATIONS.filter(r =>
    r.status === 'Checked-in' && r.checkout <= TODAY
  ), [RESERVATIONS]);
  const history = useMemo(() => RESERVATIONS.filter(r => r.status === 'Checked-out'), [RESERVATIONS]);
  const unsettled = useMemo(() => departures.filter(r => r.paymentStatus !== 'Paid'), [departures]);

  const currentList = tab === 'arrivals' ? arrivals : tab === 'inhouse' ? inhouse : tab === 'departures' ? departures : history;
  const filtered = useMemo(() => currentList.filter(r =>
    r.guest.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.room.includes(search)
  ), [currentList, search]);

  const nights = (r: Res) => Math.max(1, Math.round((new Date(r.checkout).getTime() - new Date(r.checkin).getTime()) / 86400000));

  return (
    <div className="module-page animate-in" style={{ gap: 14 }}>
      <header className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', letterSpacing: '-0.3px', marginBottom: '2px' }}>Check-In & Check-Out</h2>
          <p style={{ color: '#8B8FA3', fontSize: '12.5px' }}>Manage guest arrivals, departures, active stays, and front desk operations.</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="cio-kpis">
        {[
          { label: 'Arrivals Today', val: arrivals.length, icon: <LogIn size={16} />, bg: 'linear-gradient(135deg,#4F46E5,#7C3AED)' },
          { label: 'Pending Check-In', val: arrivals.filter(r => r.status === 'Pending').length, icon: <Clock size={16} />, bg: 'linear-gradient(135deg,#2563EB,#3B82F6)' },
          { label: 'In-House', val: inhouse.length, icon: <Users size={16} />, bg: 'linear-gradient(135deg,#059669,#10B981)' },
          { label: 'Departures Today', val: departures.length, icon: <LogOut size={16} />, bg: 'linear-gradient(135deg,#D97706,#F59E0B)' },
          { label: 'Pending Check-Out', val: departures.length, icon: <CheckCircle size={16} />, bg: 'linear-gradient(135deg,#7C3AED,#A855F7)' },
          { label: 'Unsettled', val: unsettled.length, icon: <AlertTriangle size={16} />, bg: 'linear-gradient(135deg,#E11D48,#F43F5E)' },
        ].map(k => (
          <div key={k.label} className="cio-kpi" style={{ background: k.bg }}>
            <div className="cio-kpi-icon">{k.icon}</div>
            <div><div className="cio-kpi-val">{k.val}</div><div className="cio-kpi-label">{k.label}</div></div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="cio-toolbar">
        <div className="cio-search">
          <Search size={15} color="#A0A4B8" />
          <input placeholder="Search guest, room, or reservation..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Tabs + Table */}
      <div>
        <div className="cio-tabs">
          {([
            { key: 'arrivals', label: 'Arrivals', count: arrivals.length },
            { key: 'inhouse', label: 'In-House', count: inhouse.length },
            { key: 'departures', label: 'Departures', count: departures.length },
            { key: 'history', label: 'History', count: history.length },
          ] as const).map(t => (
            <button key={t.key} className={`cio-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}<span className="cio-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="cio-table-card">
          {filtered.length === 0 ? (
            <div className="cio-empty">
              {tab === 'arrivals' && 'No arrivals scheduled.'}
              {tab === 'inhouse' && 'No guests currently in-house.'}
              {tab === 'departures' && 'No departures due.'}
              {tab === 'history' && 'No check-out history yet.'}
            </div>
          ) : (
            <table className="cio-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>ID</th>
                  <th style={{ width: 160 }}>Guest</th>
                  <th style={{ width: 80 }}>Room</th>
                  <th style={{ width: 110 }}>Check-in</th>
                  <th style={{ width: 110 }}>Check-out</th>
                  <th style={{ width: 60 }}>Nights</th>
                  <th style={{ width: 90 }}>Amount</th>
                  <th style={{ width: 100 }}>Payment</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 100 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const st = STATUS_COLORS[r.status] || STATUS_COLORS.Confirmed;
                  const av = getAvatarColor(r.guest);
                  return (
                    <tr key={r.id} onClick={() => setSelectedRes(r)}>
                      <td style={{ fontFamily: 'monospace', color: '#A0A4B8', fontSize: 12 }}>{r.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{getInitials(r.guest)}</div>
                          <span className="cio-guest-name">{r.guest}</span>
                        </div>
                      </td>
                      <td><span className="cio-room-pill">{r.room}</span></td>
                      <td>{formatDateV2(r.checkin)}</td>
                      <td>{formatDateV2(r.checkout)}</td>
                      <td style={{ textAlign: 'center' }}>{nights(r)}</td>
                      <td style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>${r.total.toLocaleString()}</td>
                      <td>
                        <span className="cio-status" style={{ background: r.paymentStatus === 'Paid' ? '#ECFDF5' : '#FFFBEB', color: r.paymentStatus === 'Paid' ? '#059669' : '#D97706' }}>
                          <span className="cio-status-dot" style={{ background: r.paymentStatus === 'Paid' ? '#059669' : '#D97706' }} />
                          {r.paymentStatus || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="cio-status" style={{ background: st.bg, color: st.color }}>
                          <span className="cio-status-dot" style={{ background: st.dot }} />
                          {r.status}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {(r.status === 'Confirmed' || r.status === 'Pending') && <button className="cio-action-btn cio-action-btn-primary" onClick={() => setCheckInRes(r)}><UserCheck size={12} /> Check In</button>}
                        {r.status === 'Checked-in' && <button className="cio-action-btn cio-action-btn-primary" onClick={() => setCheckOutRes(r)}><LogOut size={12} /> Check Out</button>}
                        {r.status === 'Checked-out' && <button className="cio-action-btn" onClick={() => setSelectedRes(r)}><Eye size={12} /> View</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ReservationModal reservation={selectedRes} onClose={() => setSelectedRes(null)} />
      <CheckInModal reservation={checkInRes} onClose={() => setCheckInRes(null)} onComplete={(id) => { checkIn(id); setCheckInRes(null); }} />
      <CheckOutModal reservation={checkOutRes} onClose={() => setCheckOutRes(null)} onComplete={(id) => { checkOut(id); setCheckOutRes(null); }} />
    </div>
  );
};

export default CheckInOut;