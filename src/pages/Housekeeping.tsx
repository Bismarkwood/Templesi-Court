import { useState, useMemo } from 'react';
import { CheckCircle, Clock, Sparkles, AlertTriangle, BedDouble, Search } from 'lucide-react';
import { ROOMS, HOUSEKEEPING } from '../data/mockData';
import './Housekeeping.css';
import '../styles/modules.css';

const HK_STATUSES = ['All', 'Ready', 'Awaiting Cleaning', 'In Progress', 'Not Ready'];
const HK_COLORS: Record<string, { bg: string; color: string }> = {
  'Ready': { bg: '#ECFDF5', color: '#059669' },
  'Awaiting Cleaning': { bg: '#FFFBEB', color: '#D97706' },
  'In Progress': { bg: '#EEF2FF', color: '#4F46E5' },
  'Not Ready': { bg: '#FFF1F2', color: '#E11D48' },
};

const Housekeeping = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const enriched = useMemo(() => HOUSEKEEPING.map(h => {
    const room = ROOMS.find(r => r.id === h.room);
    return { ...h, type: room?.type || 'Unknown', floor: room?.floor || 0, capacity: room?.capacity || 0 };
  }), []);

  const filtered = useMemo(() => enriched.filter(h => {
    const statusMatch = filter === 'All' || h.status === filter;
    const searchMatch = h.room.includes(search) || h.type.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  }), [filter, search, enriched]);

  const counts = useMemo(() => ({
    ready: enriched.filter(h => h.status === 'Ready').length,
    awaiting: enriched.filter(h => h.status === 'Awaiting Cleaning').length,
    inProgress: enriched.filter(h => h.status === 'In Progress').length,
    notReady: enriched.filter(h => h.status === 'Not Ready').length,
    total: enriched.length,
  }), [enriched]);

  return (
    <div className="module-page animate-in" style={{ gap: 14 }}>
      <header className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', letterSpacing: '-0.3px', marginBottom: '2px' }}>Housekeeping</h2>
          <p style={{ color: '#8B8FA3', fontSize: '12.5px' }}>Room cleaning queue, readiness tracking, and floor-based operations.</p>
        </div>
      </header>

      <div className="hk-kpis">
        {[
          { label: 'Total Rooms', val: counts.total, icon: <BedDouble size={16} />, bg: 'linear-gradient(135deg,#4F46E5,#7C3AED)' },
          { label: 'Ready', val: counts.ready, icon: <CheckCircle size={16} />, bg: 'linear-gradient(135deg,#059669,#10B981)' },
          { label: 'Awaiting', val: counts.awaiting, icon: <Clock size={16} />, bg: 'linear-gradient(135deg,#D97706,#F59E0B)' },
          { label: 'In Progress', val: counts.inProgress, icon: <Sparkles size={16} />, bg: 'linear-gradient(135deg,#2563EB,#3B82F6)' },
          { label: 'Not Ready', val: counts.notReady, icon: <AlertTriangle size={16} />, bg: 'linear-gradient(135deg,#E11D48,#F43F5E)' },
        ].map(k => (
          <div key={k.label} className="hk-kpi" style={{ background: k.bg }}>
            <div className="hk-kpi-icon">{k.icon}</div>
            <div><div className="hk-kpi-val">{k.val}</div><div className="hk-kpi-label">{k.label}</div></div>
          </div>
        ))}
      </div>

      <div className="hk-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 260, background: '#F7F8FC', borderRadius: 10, padding: '8px 14px' }}>
          <Search size={15} color="#A0A4B8" />
          <input style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 500, color: '#1E1E2D', width: '100%' }} placeholder="Search room..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.06)' }} />
        <div className="hk-filters">
          {HK_STATUSES.map(s => (
            <button key={s} className={`hk-filter ${filter === s ? 'active' : 'inactive'}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="hk-empty">No rooms match your filter.</div>
      ) : (
        <div className="hk-grid">
          {filtered.map(h => {
            const st = HK_COLORS[h.status] || HK_COLORS['Ready'];
            return (
              <div key={h.room} className="hk-room-card">
                <div className="hk-room-num">{h.room}</div>
                <div className="hk-room-type">{h.type} · Floor {h.floor} · {h.capacity} guests</div>
                <div className="hk-room-status" style={{ background: st.bg, color: st.color }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />
                  {h.status}
                </div>
                {h.priority && <div className="hk-room-meta" style={{ color: '#E11D48', fontWeight: 600 }}>⚠ Priority — reserved room not ready</div>}
                <div className="hk-room-actions">
                  {h.status === 'Awaiting Cleaning' && <button className="hk-action-btn hk-action-btn-primary"><Sparkles size={12} /> Start Cleaning</button>}
                  {h.status === 'In Progress' && <button className="hk-action-btn hk-action-btn-primary"><CheckCircle size={12} /> Mark Ready</button>}
                  {h.status === 'Not Ready' && <button className="hk-action-btn hk-action-btn-primary"><Sparkles size={12} /> Start Cleaning</button>}
                  {h.status === 'Ready' && <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>✓ Room is ready</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Housekeeping;