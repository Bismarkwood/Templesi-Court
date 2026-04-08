import { ROOMS, GUESTS, INVOICES, RESERVATIONS, STAFF } from '../data/mockData';
import { getAvatarColor, getInitials } from '../utils/formatters';
import {
  BarChart3, TrendingUp, DollarSign, Users, Building2,
  CalendarCheck, ArrowUpRight, ArrowDownRight, Star, BedDouble,
} from 'lucide-react';
import './Analytics.css';
import '../styles/modules.css';

// ─── Computed analytics data ───

const totalRooms = ROOMS.length;
const occupied = ROOMS.filter(r => r.status === 'Occupied').length;
const available = ROOMS.filter(r => r.status === 'Available').length;
const reserved = ROOMS.filter(r => r.status === 'Reserved').length;
const maintenance = ROOMS.filter(r => r.status === 'Maintenance').length;
const occupancyRate = Math.round((occupied / totalRooms) * 100);

const totalRevenue = INVOICES.reduce((s, i) => s + i.amount, 0);
const paidRevenue = INVOICES.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
const pendingRevenue = INVOICES.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
const collectionRate = totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0;

const totalBookings = RESERVATIONS.length;
const checkedIn = RESERVATIONS.filter(r => r.status === 'Checked-in').length;
const confirmed = RESERVATIONS.filter(r => r.status === 'Confirmed').length;
const pending = RESERVATIONS.filter(r => r.status === 'Pending').length;

const avgDailyRate = occupied > 0
  ? Math.round(ROOMS.filter(r => r.status === 'Occupied').reduce((s, r) => s + r.rate, 0) / occupied)
  : 0;

const revPerRoom = totalRooms > 0 ? Math.round(paidRevenue / totalRooms) : 0;

const roomTypeBreakdown = ['Standard', 'Deluxe', 'Suite'].map(type => {
  const rooms = ROOMS.filter(r => r.type === type);
  const occ = rooms.filter(r => r.status === 'Occupied').length;
  return { type, total: rooms.length, occupied: occ, rate: rooms.length > 0 ? Math.round((occ / rooms.length) * 100) : 0 };
});

const topGuests = [...GUESTS].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

const staffByRole = STAFF.reduce<Record<string, { total: number; onDuty: number }>>((acc, s) => {
  if (!acc[s.role]) acc[s.role] = { total: 0, onDuty: 0 };
  acc[s.role].total++;
  if (s.status === 'On Duty') acc[s.role].onDuty++;
  return acc;
}, {});

// Simulated weekly revenue trend (mock sparkline data)
const weeklyRevenue = [680, 1240, 920, 1390, 840, 1100, paidRevenue];
const maxWeekly = Math.max(...weeklyRevenue);

const Analytics = () => (
  <div className="module-page animate-in">
    {/* Header */}
    <header className="page-header">
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', letterSpacing: '-0.3px', marginBottom: '2px' }}>Analytics</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Performance insights, occupancy trends, revenue analysis, and guest intelligence.</p>
      </div>
    </header>

    {/* Row 1: Key Metrics */}
    <div className="stats-strip" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
      {[
        { label: 'Occupancy Rate', value: `${occupancyRate}%`, trend: '+8%', up: true },
        { label: 'Avg Daily Rate', value: `$${avgDailyRate}`, trend: '+$12', up: true },
        { label: 'RevPAR', value: `$${revPerRoom}`, trend: '+5%', up: true },
        { label: 'Total Bookings', value: totalBookings, trend: '+3', up: true },
        { label: 'Collection Rate', value: `${collectionRate}%`, trend: '-2%', up: false },
        { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, trend: '+14%', up: true },
      ].map(m => (
        <div key={m.label} className="stat-card">
          <div className="stat-card-label">{m.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div className="stat-card-value">{m.value}</div>
            <span className={`analytics-trend ${m.up ? 'up' : 'down'}`}>
              {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {m.trend}
            </span>
          </div>
        </div>
      ))}
    </div>

    {/* Row 2: Occupancy by Room Type + Revenue Trend */}
    <div className="analytics-grid analytics-2col">
      {/* Occupancy by Room Type */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title"><BedDouble size={15} /> Occupancy by Room Type</div>
        </div>
        <div className="analytics-card-body">
          <div className="analytics-bars">
            {roomTypeBreakdown.map(rt => (
              <div key={rt.type} className="analytics-bar-row">
                <span className="analytics-bar-label">{rt.type}</span>
                <div className="analytics-bar-track">
                  <div className="analytics-bar-fill" style={{
                    width: `${Math.max(rt.rate, 8)}%`,
                    background: rt.type === 'Standard' ? 'var(--primary)' : rt.type === 'Deluxe' ? '#059669' : '#D97706',
                  }}>
                    {rt.rate}%
                  </div>
                </div>
                <span className="analytics-bar-value">{rt.occupied}/{rt.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title"><TrendingUp size={15} /> Weekly Revenue Trend</div>
        </div>
        <div className="analytics-card-body">
          <div className="analytics-metric-row">
            <div className="analytics-metric">
              <div className="analytics-metric-value">${paidRevenue.toLocaleString()}</div>
              <div className="analytics-metric-label">Collected</div>
            </div>
            <div className="analytics-metric">
              <div className="analytics-metric-value">${pendingRevenue.toLocaleString()}</div>
              <div className="analytics-metric-label">Pending</div>
            </div>
            <div className="analytics-metric">
              <div className="analytics-metric-value">{collectionRate}%</div>
              <div className="analytics-metric-label">Collection</div>
            </div>
          </div>
          <div className="analytics-sparkline-row">
            {weeklyRevenue.map((v, i) => (
              <div key={i} className="analytics-spark-bar" style={{ height: `${(v / maxWeekly) * 100}%` }} title={`$${v.toLocaleString()}`} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--text-light)', fontWeight: 600 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>
      </div>
    </div>

    {/* Row 3: Room Status Donut + Booking Status + Revenue Breakdown */}
    <div className="analytics-grid analytics-3col">
      {/* Room Status Distribution */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title"><Building2 size={15} /> Room Distribution</div>
        </div>
        <div className="analytics-card-body">
          <div className="analytics-donut-wrap">
            <div className="analytics-donut" style={{
              background: `conic-gradient(
                #059669 0% ${(available / totalRooms) * 100}%,
                #E11D48 ${(available / totalRooms) * 100}% ${((available + occupied) / totalRooms) * 100}%,
                #D97706 ${((available + occupied) / totalRooms) * 100}% ${((available + occupied + reserved) / totalRooms) * 100}%,
                #94a3b8 ${((available + occupied + reserved) / totalRooms) * 100}% 100%
              )`
            }}>
              <div className="analytics-donut-center">{totalRooms}</div>
            </div>
            <div className="analytics-donut-legend">
              {[
                { label: `Available (${available})`, color: '#059669' },
                { label: `Occupied (${occupied})`, color: '#E11D48' },
                { label: `Reserved (${reserved})`, color: '#D97706' },
                { label: `Maintenance (${maintenance})`, color: '#94a3b8' },
              ].map(l => (
                <div key={l.label} className="analytics-donut-legend-item">
                  <div className="analytics-donut-legend-dot" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Status */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title"><CalendarCheck size={15} /> Booking Status</div>
        </div>
        <div className="analytics-card-body">
          <div className="analytics-bars">
            {[
              { label: 'Checked-in', count: checkedIn, color: '#059669' },
              { label: 'Confirmed', count: confirmed, color: '#4F46E5' },
              { label: 'Pending', count: pending, color: '#D97706' },
            ].map(b => (
              <div key={b.label} className="analytics-bar-row">
                <span className="analytics-bar-label">{b.label}</span>
                <div className="analytics-bar-track">
                  <div className="analytics-bar-fill" style={{
                    width: `${totalBookings > 0 ? Math.max((b.count / totalBookings) * 100, 12) : 0}%`,
                    background: b.color,
                  }}>
                    {b.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {totalBookings} total bookings
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title"><DollarSign size={15} /> Revenue Breakdown</div>
        </div>
        <div className="analytics-card-body">
          <div className="analytics-donut-wrap">
            <div className="analytics-donut" style={{
              background: `conic-gradient(
                #16A34A 0% ${totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0}%,
                #D97706 ${totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0}% 100%
              )`
            }}>
              <div className="analytics-donut-center">{collectionRate}%</div>
            </div>
            <div className="analytics-donut-legend">
              <div className="analytics-donut-legend-item">
                <div className="analytics-donut-legend-dot" style={{ background: '#16A34A' }} />
                Collected: ${paidRevenue.toLocaleString()}
              </div>
              <div className="analytics-donut-legend-item">
                <div className="analytics-donut-legend-dot" style={{ background: '#D97706' }} />
                Outstanding: ${pendingRevenue.toLocaleString()}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                Total: ${totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Row 4: Top Guests + Staff Coverage */}
    <div className="analytics-grid analytics-2col">
      {/* Top Guests by Spend */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title"><Star size={15} /> Top Guests by Revenue</div>
        </div>
        <div className="analytics-card-body">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Stays</th>
                <th>Total Spent</th>
                <th>Avg/Stay</th>
              </tr>
            </thead>
            <tbody>
              {topGuests.map(g => {
                const avatar = getAvatarColor(g.name);
                const avg = g.stays > 0 ? Math.round(g.totalSpent / g.stays) : 0;
                return (
                  <tr key={g.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar-circle" style={{ backgroundColor: avatar.bg, color: avatar.color, width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>
                          {getInitials(g.name)}
                        </div>
                        <span className="td-bold">{g.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{g.stays}</td>
                    <td className="td-bold">${g.totalSpent.toLocaleString()}</td>
                    <td>${avg}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Coverage */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title"><Users size={15} /> Staff Coverage Analysis</div>
        </div>
        <div className="analytics-card-body">
          <div className="analytics-bars">
            {Object.entries(staffByRole).map(([role, data]) => (
              <div key={role} className="analytics-bar-row">
                <span className="analytics-bar-label">{role}</span>
                <div className="analytics-bar-track">
                  <div className="analytics-bar-fill" style={{
                    width: `${data.total > 0 ? Math.max((data.onDuty / data.total) * 100, 15) : 0}%`,
                    background: data.onDuty === 0 ? '#E11D48' : data.onDuty < data.total ? '#D97706' : '#059669',
                  }}>
                    {data.onDuty}/{data.total}
                  </div>
                </div>
                <span className="analytics-bar-value" style={{ color: data.onDuty === 0 ? '#E11D48' : 'var(--text-primary)' }}>
                  {data.total > 0 ? Math.round((data.onDuty / data.total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
            {STAFF.filter(s => s.status === 'On Duty').length} of {STAFF.length} staff currently on duty
          </div>
        </div>
      </div>
    </div>

    {/* Row 5: Room Rate Analysis */}
    <div className="analytics-grid" style={{ gridTemplateColumns: '1fr' }}>
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title"><BarChart3 size={15} /> Room Rate Performance</div>
        </div>
        <div className="analytics-card-body">
          <div className="analytics-bars">
            {ROOMS.map(room => (
              <div key={room.id} className="analytics-bar-row">
                <span className="analytics-bar-label" style={{ minWidth: 50 }}>{room.id}</span>
                <div className="analytics-bar-track">
                  <div className="analytics-bar-fill" style={{
                    width: `${(room.rate / 300) * 100}%`,
                    background: room.status === 'Occupied' ? '#E11D48' : room.status === 'Available' ? '#059669' : room.status === 'Reserved' ? '#D97706' : '#94a3b8',
                  }}>
                    ${room.rate}
                  </div>
                </div>
                <span className="analytics-bar-value" style={{ minWidth: 70 }}>{room.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Analytics;