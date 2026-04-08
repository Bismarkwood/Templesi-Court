import { Wrench, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';
import { MAINTENANCE_ISSUES, ROOMS } from '../data/mockData';
import './Maintenance.css';
import '../styles/modules.css';

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  High: { bg: '#FFF1F2', color: '#E11D48' },
  Medium: { bg: '#FFFBEB', color: '#D97706' },
  Low: { bg: '#F0F1F5', color: '#6B6F80' },
};
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Open: { bg: '#FFF1F2', color: '#E11D48' },
  'In Progress': { bg: '#EEF2FF', color: '#4F46E5' },
  Resolved: { bg: '#ECFDF5', color: '#059669' },
};

const Maintenance = () => {
  const openCount = MAINTENANCE_ISSUES.filter(i => i.status === 'Open').length;
  const inProgressCount = MAINTENANCE_ISSUES.filter(i => i.status === 'In Progress').length;
  const resolvedCount = MAINTENANCE_ISSUES.filter(i => i.status === 'Resolved').length;
  const blockedRooms = ROOMS.filter(r => r.status === 'Maintenance').length;

  return (
    <div className="module-page animate-in" style={{ gap: 14 }}>
      <header className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', letterSpacing: '-0.3px', marginBottom: '2px' }}>Maintenance</h2>
          <p style={{ color: '#8B8FA3', fontSize: '12.5px' }}>Issue tracking, room repairs, and operational readiness management.</p>
        </div>
      </header>

      <div className="mt-kpis">
        {[
          { label: 'Open Issues', val: openCount, icon: <AlertTriangle size={16} />, bg: 'linear-gradient(135deg,#E11D48,#F43F5E)' },
          { label: 'In Progress', val: inProgressCount, icon: <Clock size={16} />, bg: 'linear-gradient(135deg,#4F46E5,#7C3AED)' },
          { label: 'Resolved', val: resolvedCount, icon: <CheckCircle size={16} />, bg: 'linear-gradient(135deg,#059669,#10B981)' },
          { label: 'Rooms Blocked', val: blockedRooms, icon: <Wrench size={16} />, bg: 'linear-gradient(135deg,#D97706,#F59E0B)' },
        ].map(k => (
          <div key={k.label} className="mt-kpi" style={{ background: k.bg }}>
            <div className="mt-kpi-icon">{k.icon}</div>
            <div><div className="mt-kpi-val">{k.val}</div><div className="mt-kpi-label">{k.label}</div></div>
          </div>
        ))}
      </div>

      <div className="mt-table-card">
        <table className="mt-table">
          <thead>
            <tr>
              <th style={{width:80}}>ID</th>
              <th style={{width:80}}>Room</th>
              <th style={{width:200}}>Issue</th>
              <th style={{width:100}}>Priority</th>
              <th style={{width:100}}>Reported</th>
              <th style={{width:120}}>Status</th>
              <th style={{width:120}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {MAINTENANCE_ISSUES.map(issue => {
              const pc = PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS.Low;
              const sc = STATUS_COLORS[issue.status] || STATUS_COLORS.Open;
              return (
                <tr key={issue.id}>
                  <td style={{ fontFamily: 'monospace', color: '#A0A4B8', fontSize: 12 }}>{issue.id}</td>
                  <td><span style={{ fontWeight: 700, color: '#1E1E2D' }}>{issue.room}</span></td>
                  <td>{issue.issue}</td>
                  <td><span className="mt-priority" style={{ background: pc.bg, color: pc.color }}>{issue.priority}</span></td>
                  <td style={{ fontSize: 12, color: '#8B8FA3' }}>{issue.reportedAt}</td>
                  <td><span className="mt-status" style={{ background: sc.bg, color: sc.color }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color }} />{issue.status}</span></td>
                  <td>
                    {issue.status === 'Open' && <button className="mt-action-btn"><Clock size={12} /> Start</button>}
                    {issue.status === 'In Progress' && <button className="mt-action-btn mt-action-btn-primary"><CheckCircle size={12} /> Resolve</button>}
                    {issue.status === 'Resolved' && <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>✓ Done</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Maintenance;