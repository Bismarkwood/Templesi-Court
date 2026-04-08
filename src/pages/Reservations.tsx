import { useState, useMemo } from 'react';
import Modal from '../components/ui/Modal';
import ReservationModal from '../components/ui/ReservationModal';
import Pagination from '../components/ui/Pagination';
import { Search, Plus, Download, CalendarCheck, UserCheck, CheckCircle, DollarSign } from 'lucide-react';
import { formatDateV2, getAvatarColor, getInitials, getStatusConfig } from '../utils/formatters';
import { ROOMS } from '../data/mockData';
import '../styles/modules.css';

const ITEMS_PER_PAGE = 8;

const INITIAL_RESERVATIONS = [
  { id: 'RES-001', guest: 'Alice Cooper', room: '102', checkin: '2026-04-06', checkout: '2026-04-09', total: 360, status: 'Checked-in' },
  { id: 'RES-002', guest: 'Bob Smith',    room: '301', checkin: '2026-04-03', checkout: '2026-04-06', total: 840, status: 'Checked-out' },
  { id: 'RES-003', guest: 'Charlie Day',  room: '103', checkin: '2026-04-10', checkout: '2026-04-12', total: 360, status: 'Confirmed' },
  { id: 'RES-004', guest: 'Emma Wilson',  room: '105', checkin: '2026-04-15', checkout: '2026-04-20', total: 1400, status: 'Confirmed' },
  { id: 'RES-005', guest: 'David Patel',  room: '201', checkin: '2026-04-05', checkout: '2026-04-07', total: 550, status: 'Checked-in' },
  { id: 'RES-006', guest: 'Sarah Connor', room: '405', checkin: '2026-04-18', checkout: '2026-04-22', total: 920, status: 'Pending' },
];

const EMPTY_FORM = { guest: '', room: '', checkin: '', checkout: '', status: 'Confirmed' };

const Reservations = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [showNewModal, setShowNewModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedRes, setSelectedRes] = useState<typeof INITIAL_RESERVATIONS[0] | null>(null);

  const filtered = useMemo(() => reservations.filter(r => {
    const statusMatch = filter === 'All' || r.status === filter;
    const searchMatch = r.guest.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  }), [filter, search, reservations]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Kpis
  const kpiTotal = reservations.length;
  const kpiActive = reservations.filter(r => r.status === 'Checked-in').length;
  const kpiConfirmed = reservations.filter(r => r.status === 'Confirmed').length;
  const kpiRevenue = reservations.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="module-page animate-in">
      
      {/* 1. Page Header */}
      <header className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', letterSpacing: '-0.3px', marginBottom: '2px' }}>Reservations</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Manage the full booking lifecycle from confirmation to check-out.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button className="btn-secondary"><Download size={16} /> Export</button>
           <button className="btn-primary" onClick={() => setShowNewModal(true)}><Plus size={18} /> New Booking</button>
        </div>
      </header>

      {/* 2. Gradient KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Bookings', val: kpiTotal, icon: <CalendarCheck size={18}/>, bg: 'linear-gradient(135deg,#4F46E5,#7C3AED)' },
          { label: 'Currently Active', val: kpiActive, icon: <UserCheck size={18}/>, bg: 'linear-gradient(135deg,#059669,#10B981)' },
          { label: 'Confirmed', val: kpiConfirmed, icon: <CheckCircle size={18}/>, bg: 'linear-gradient(135deg,#2563EB,#3B82F6)' },
          { label: 'Projected Revenue', val: `$${kpiRevenue.toLocaleString()}`, icon: <DollarSign size={18}/>, bg: 'linear-gradient(135deg,#D97706,#F59E0B)' },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, color: '#fff', transition: 'transform 0.15s ease' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, marginTop: 2 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Toolbar */}
      <div className="toolbar-card">
         <div className="search-box">
            <Search size={16} color="var(--text-light)" />
            <input placeholder="Search guest or ID..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
         </div>
         <div className="filter-pills">
            {['All', 'Confirmed', 'Checked-in', 'Checked-out', 'Pending'].map(f => (
              <button 
                key={f} 
                onClick={() => { setFilter(f); setCurrentPage(1); }}
                className={`filter-pill ${filter === f ? 'active' : 'inactive'}`}
              >
                {f}
              </button>
            ))}
         </div>
      </div>

      {/* 4. Table */}
      <div className="table-card">
        <table className="premium-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>ID</th>
              <th style={{ width: '250px' }}>Guest</th>
              <th style={{ width: '100px' }}>Room</th>
              <th style={{ width: '150px' }}>Check-in</th>
              <th style={{ width: '150px' }}>Check-out</th>
              <th style={{ width: '120px' }}>Amount</th>
              <th style={{ width: '160px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(r => {
              const avatar = getAvatarColor(r.guest);
              const statusCfg = getStatusConfig(r.status);
              return (
                <tr key={r.id} onClick={() => setSelectedRes(r)} style={{ cursor: 'pointer' }}>
                  <td className="td-id">{r.id}</td>
                  <td>
                    <div className="avatar-cell">
                      <div className="avatar-circle" style={{ backgroundColor: avatar.bg, color: avatar.color }}>{getInitials(r.guest)}</div>
                      <span className="td-bold">{r.guest}</span>
                    </div>
                  </td>
                  <td>
                    <div className="pill-room">{r.room}</div>
                  </td>
                  <td>{formatDateV2(r.checkin)}</td>
                  <td>{formatDateV2(r.checkout)}</td>
                  <td className="td-tabular">${r.total.toLocaleString()}</td>
                  <td>
                    <div className="pill-status" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                      <div className="dot" style={{ backgroundColor: statusCfg.dot }}></div>
                      {r.status}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={ITEMS_PER_PAGE} totalItems={filtered.length} />
          </div>
        )}
      </div>

      {/* 6. New Booking Modal */}
      <Modal
        open={showNewModal}
        onClose={() => { setShowNewModal(false); setForm(EMPTY_FORM); }}
        title="New Reservation"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setShowNewModal(false); setForm(EMPTY_FORM); }}>Cancel</button>
            <button
              className="btn-primary"
              disabled={!form.guest || !form.room || !form.checkin || !form.checkout}
              onClick={() => {
                const room = ROOMS.find(r => r.id === form.room);
                const nights = Math.max(1, Math.round((new Date(form.checkout).getTime() - new Date(form.checkin).getTime()) / 86400000));
                const total = (room?.rate ?? 0) * nights;
                const newRes = {
                  id: `RES-${String(reservations.length + 1).padStart(3, '0')}`,
                  guest: form.guest,
                  room: form.room,
                  checkin: form.checkin,
                  checkout: form.checkout,
                  total,
                  status: form.status,
                };
                setReservations(prev => [...prev, newRes]);
                setShowNewModal(false);
                setForm(EMPTY_FORM);
              }}
            >
              Create Booking
            </button>
          </>
        }
      >
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Guest Name</label>
            <input
              className="form-input"
              placeholder="Full name"
              value={form.guest}
              onChange={e => setForm(f => ({ ...f, guest: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Room</label>
              <select
                className="form-select"
                value={form.room}
                onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
              >
                <option value="">Select room</option>
                {ROOMS.filter(r => r.status === 'Available').map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.type} (${r.rate}/night)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Check-in</label>
              <input
                className="form-input"
                type="date"
                value={form.checkin}
                onChange={e => setForm(f => ({ ...f, checkin: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Check-out</label>
              <input
                className="form-input"
                type="date"
                value={form.checkout}
                onChange={e => setForm(f => ({ ...f, checkout: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </Modal>

      <ReservationModal reservation={selectedRes} onClose={() => setSelectedRes(null)} />
    </div>
  );
};

export default Reservations;
