import { useState, useMemo } from 'react';
import Pagination from '../components/ui/Pagination';
import { Receipt, Search, FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { formatDateV2, getAvatarColor, getInitials, getStatusConfig } from '../utils/formatters';
import '../styles/modules.css';
import { INVOICES } from '../data/mockData';

const ITEMS_PER_PAGE = 7;

const Billing = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => INVOICES.filter(i => {
    const searchMatch = i.guest.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase());
    const statusMatch = filter === 'All' || i.status === filter;
    return searchMatch && statusMatch;
  }), [search, filter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="module-page animate-in">
      {/* 1. Page Header */}
      <header className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', letterSpacing: '-0.3px', marginBottom: '2px' }}>Billing & Invoicing</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Track financial transactions and manage the invoice lifecycle.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button className="btn-secondary"><FileText size={16} /> Audit Logs</button>
           <button className="btn-primary"><Receipt size={18} /> New Invoice</button>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Invoices', val: INVOICES.length, icon: <Receipt size={18}/>, bg: 'linear-gradient(135deg,#4F46E5,#7C3AED)' },
          { label: 'Pending', val: INVOICES.filter(i => i.status === 'Pending').length, icon: <Clock size={18}/>, bg: 'linear-gradient(135deg,#D97706,#F59E0B)' },
          { label: 'Paid', val: INVOICES.filter(i => i.status === 'Paid').length, icon: <CheckCircle size={18}/>, bg: 'linear-gradient(135deg,#059669,#10B981)' },
          { label: 'Total Value', val: `$${INVOICES.reduce((a,i) => a+i.amount, 0).toLocaleString()}`, icon: <DollarSign size={18}/>, bg: 'linear-gradient(135deg,#2563EB,#3B82F6)' },
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
         <div className="search-box">
            <Search size={16} color="var(--text-light)" />
            <input placeholder="Search guest or invoice ID..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
         </div>
         <div className="filter-pills">
            {['All', 'Pending', 'Paid'].map(f => (
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
              <th style={{ width: '120px' }}>Invoice No.</th>
              <th style={{ width: '250px' }}>Guest Name</th>
              <th style={{ width: '100px' }}>Room No.</th>
              <th style={{ width: '120px' }}>Total Amount</th>
              <th style={{ width: '150px' }}>Invoice Date</th>
              <th style={{ width: '160px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(inv => {
              const avatar = getAvatarColor(inv.guest);
              const statusCfg = getStatusConfig(inv.status);
              return (
                <tr key={inv.id}>
                  <td className="td-id">{inv.id}</td>
                  <td>
                    <div className="avatar-cell">
                      <div className="avatar-circle" style={{ backgroundColor: avatar.bg, color: avatar.color }}>{getInitials(inv.guest)}</div>
                      <span className="td-bold">{inv.guest}</span>
                    </div>
                  </td>
                  <td>
                    <div className="pill-room">{inv.room}</div>
                  </td>
                  <td className="td-tabular">${inv.amount.toLocaleString()}</td>
                  <td>{formatDateV2(inv.date)}</td>
                  <td>
                    <div className="pill-status" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                      <div className="dot" style={{ backgroundColor: statusCfg.dot }}></div>
                      {inv.status}
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

    </div>
  );
};

export default Billing;
