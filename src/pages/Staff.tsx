import { useState, useMemo } from 'react';
import AddStaffModal from '../components/ui/AddStaffModal';
import Pagination from '../components/ui/Pagination';
import { Search, Calendar, UserPlus, Users, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { getAvatarColor, getInitials } from '../utils/formatters';
import '../styles/modules.css';

const ITEMS_PER_PAGE = 8;

const INIT_STAFF = [
  { id: 'STF-01', name: 'James Wilson',  role: 'Front Desk',   shift: 'Morning',   status: 'On Duty',  rating: 4.9, email: 'james.w@templesicourt.com' },
  { id: 'STF-02', name: 'Maria Garcia',  role: 'Housekeeping', shift: 'Afternoon', status: 'Off Duty', rating: 4.7, email: 'maria.g@templesicourt.com' },
  { id: 'STF-03', name: 'Robert Chen',   role: 'Concierge',    shift: 'Morning',   status: 'On Duty',  rating: 4.8, email: 'robert.c@templesicourt.com' },
  { id: 'STF-04', name: 'Sarah Miller',  role: 'Security',     shift: 'Night',     status: 'On Duty',  rating: 4.9, email: 'sarah.m@templesicourt.com' },
  { id: 'STF-05', name: 'David Jones',   role: 'Front Desk',   shift: 'Afternoon', status: 'Off Duty', rating: 4.6, email: 'david.j@templesicourt.com' },
];

const Staff = () => {
  const [staff, setStaff] = useState(INIT_STAFF);
  const [filterShift, setFilterShift] = useState('All Shifts');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => staff.filter(s => {
    const shiftMatch = filterShift === 'All Shifts' || s.shift === filterShift;
    const searchMatch = s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase());
    return shiftMatch && searchMatch;
  }), [filterShift, search, staff]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="module-page animate-in">
      <header className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', letterSpacing: '-0.3px', marginBottom: '2px' }}>Staff Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Track employee schedules, roles, and real-time duty status.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary"><Calendar size={16} /> Roster Settings</button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}><UserPlus size={18} /> Add Employee</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Staff', val: staff.length, icon: <Users size={18}/>, bg: 'linear-gradient(135deg,#4F46E5,#7C3AED)' },
          { label: 'On Duty', val: staff.filter(s => s.status === 'On Duty').length, icon: <ShieldCheck size={18}/>, bg: 'linear-gradient(135deg,#059669,#10B981)' },
          { label: 'Morning Shift', val: staff.filter(s => s.shift === 'Morning').length, icon: <Clock size={18}/>, bg: 'linear-gradient(135deg,#2563EB,#3B82F6)' },
          { label: 'Off Duty', val: staff.filter(s => s.status === 'Off Duty').length, icon: <AlertTriangle size={18}/>, bg: 'linear-gradient(135deg,#D97706,#F59E0B)' },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, color: '#fff' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, marginTop: 2 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="toolbar-card">
        <div className="search-box">
          <Search size={16} color="var(--text-light)" />
          <input placeholder="Search name or role..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="filter-pills">
          {['All Shifts', 'Morning', 'Afternoon', 'Night'].map(f => (
            <button key={f} onClick={() => { setFilterShift(f); setCurrentPage(1); }} className={`filter-pill ${filterShift === f ? 'active' : 'inactive'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <table className="premium-table">
          <thead>
            <tr>
              <th style={{ width: '250px' }}>Employee</th>
              <th style={{ width: '150px' }}>Role</th>
              <th style={{ width: '120px' }}>Shift</th>
              <th style={{ width: '250px' }}>Email</th>
              <th style={{ width: '150px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(s => {
              const avatar = getAvatarColor(s.name);
              const statusBg = s.status === 'On Duty' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)';
              const statusColor = s.status === 'On Duty' ? '#047857' : '#b45309';
              const statusDot = s.status === 'On Duty' ? '#10b981' : '#f59e0b';
              return (
                <tr key={s.id}>
                  <td>
                    <div className="avatar-cell">
                      <div className="avatar-circle" style={{ backgroundColor: avatar.bg, color: avatar.color }}>{getInitials(s.name)}</div>
                      <span className="td-bold">{s.name}</span>
                    </div>
                  </td>
                  <td>{s.role}</td>
                  <td>{s.shift} Shift</td>
                  <td>{s.email}</td>
                  <td>
                    <div className="pill-status" style={{ backgroundColor: statusBg, color: statusColor }}>
                      <div className="dot" style={{ backgroundColor: statusDot }}></div>
                      {s.status}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={ITEMS_PER_PAGE} totalItems={filtered.length} />
          </div>
        )}
      </div>

      <AddStaffModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        nextId={staff.length + 1}
        onSave={(newStaff) => {
          setStaff(prev => [...prev, newStaff]);
          setToast(`${newStaff.name} added to staff`);
          setTimeout(() => setToast(''), 3000);
        }}
      />
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#fff', background: '#059669', border: '1px solid #047857', zIndex: 100000, animation: 'fadeInUp 0.3s ease forwards' }}>{toast}</div>}
    </div>
  );
};

export default Staff;