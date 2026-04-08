import { useState, useMemo } from 'react';
import AddGuestModal from '../components/ui/AddGuestModal';
import GuestModal from '../components/ui/GuestModal';
import Pagination from '../components/ui/Pagination';
import { Search, History, UserPlus, Users, Star, DollarSign, Repeat } from 'lucide-react';
import { getAvatarColor, getInitials } from '../utils/formatters';
import '../styles/modules.css';
import { GUESTS } from '../data/mockData';

const ITEMS_PER_PAGE = 8;

const Guests = () => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<typeof GUESTS[0] | null>(null);

  const filtered = useMemo(() => GUESTS.filter(g => {
    const searchMatch = g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase());
    return searchMatch;
  }), [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="module-page animate-in">
      {/* 1. Page Header */}
      <header className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', letterSpacing: '-0.3px', marginBottom: '2px' }}>Guest Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Directory of all guests who have interacted with the property.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button className="btn-secondary"><History size={16} /> Guest History</button>
           <button className="btn-primary" onClick={() => setShowAddModal(true)}><UserPlus size={18} /> Add Guest</button>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Guests', val: GUESTS.length, icon: <Users size={18}/>, bg: 'linear-gradient(135deg,#4F46E5,#7C3AED)' },
          { label: 'Repeat Guests', val: GUESTS.filter(g => g.stays >= 3).length, icon: <Repeat size={18}/>, bg: 'linear-gradient(135deg,#059669,#10B981)' },
          { label: 'Total Stays', val: GUESTS.reduce((a,g) => a+g.stays, 0), icon: <Star size={18}/>, bg: 'linear-gradient(135deg,#2563EB,#3B82F6)' },
          { label: 'Lifetime Value', val: `$${GUESTS.reduce((a,g) => a+g.totalSpent, 0).toLocaleString()}`, icon: <DollarSign size={18}/>, bg: 'linear-gradient(135deg,#D97706,#F59E0B)' },
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

      {/* 2. Toolbar */}
      <div className="toolbar-card">
         <div className="search-box" style={{ maxWidth: '400px' }}>
            <Search size={16} color="var(--text-light)" />
            <input placeholder="Search name or email..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
         </div>
      </div>

      {/* 4. Table */}
      <div className="table-card">
        <table className="premium-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>ID</th>
              <th style={{ width: '250px' }}>Guest Profile</th>
              <th style={{ width: '250px' }}>Email Address</th>
              <th style={{ width: '150px' }}>Phone Number</th>
              <th style={{ width: '100px' }}>Total Stays</th>
              <th style={{ width: '120px' }}>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(g => {
              const avatar = getAvatarColor(g.name);
              return (
                <tr key={g.id} onClick={() => setSelectedGuest(g)} style={{ cursor: 'pointer' }}>
                  <td className="td-id">{g.id}</td>
                  <td>
                    <div className="avatar-cell">
                      <div className="avatar-circle" style={{ backgroundColor: avatar.bg, color: avatar.color }}>{getInitials(g.name)}</div>
                      <span className="td-bold">{g.name}</span>
                    </div>
                  </td>
                  <td>{g.email}</td>
                  <td>{g.phone}</td>
                  <td className="td-tabular" style={{ textAlign: 'center' }}>{g.stays}</td>
                  <td className="td-tabular">${g.totalSpent.toLocaleString()}</td>
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

      <GuestModal guest={selectedGuest} onClose={() => setSelectedGuest(null)} />
      <AddGuestModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(guest) => {
          setToast(`Guest ${guest.name} created successfully`);
          setTimeout(() => setToast(''), 3000);
        }}
      />
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#fff', background: '#059669', border: '1px solid #047857', zIndex: 100000, animation: 'fadeInUp 0.3s ease forwards' }}>{toast}</div>}
    </div>
  );
};

export default Guests;
