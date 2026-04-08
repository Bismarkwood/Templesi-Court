import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROOMS, GUESTS, INVOICES, ACTIVITY_FEED, RESERVATIONS, STAFF, MAINTENANCE_ISSUES, HOUSEKEEPING } from '../data/mockData';
import { getAvatarColor, getInitials, formatDateV2 } from '../utils/formatters';
import {
  computeOccupancyRate, computeAvailableRooms, computeArrivalsToday, computeDeparturesToday,
  computeRevenueToday, computePendingInvoices, filterActivityFeed, filterUpcomingCheckins,
  groupRoomsByFloor, getRoomStatusColor, computeHousekeepingCounts, computeMaintenanceSummary,
  computeRevenueSummary, computeBillingHealth, groupStaffByRole, detectCoverageGaps,
  identifyRepeatGuests, identifyGuestsWithUnpaidBalances, generateAlerts,
} from '../utils/dashboardHelpers';
import {
  TrendingUp, BarChart3, PlusCircle, Download, ArrowUpRight, ArrowDownRight,
  Map as MapIcon, AlertTriangle, Wrench, Users, Star, BedDouble, Receipt,
  Clock, CalendarCheck, CalendarMinus, DollarSign, FileWarning,
  Building2, DoorOpen,
} from 'lucide-react';
import './Dashboard.css';
import '../styles/modules.css';

const TODAY = '2026-04-08';

// Mock sparkline data
const SPARK_OCC = [58, 62, 65, 60, 68, 72, 73];
const SPARK_REV = [680, 1240, 920, 1390, 840, 1100, 1390];
const SPARK_BOOK = [3, 5, 4, 6, 3, 7, 5];
const SPARK_ADR = [145, 152, 148, 160, 155, 158, 162];
const FORECAST_OCC = [73, 78, 82, 75, 80, 85, 88];
const FORECAST_REV = [1390, 1520, 1680, 1450, 1600, 1750, 1900];

const FEED_COLORS: Record<string, string> = {
  'check-in': '#059669', 'check-out': '#4F46E5', 'payment': '#16A34A', 'maintenance': '#D97706',
};

const Spark = ({ data, color = 'var(--primary)', h = 28 }: { data: number[]; color?: string; h?: number }) => {
  const max = Math.max(...data);
  return (
    <div className="d-spark" style={{ height: h }}>
      {data.map((v, i) => (
        <div key={i} className="d-spark-bar" style={{ height: `${(v / max) * 100}%`, background: color }} />
      ))}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [feedFilter, setFeedFilter] = useState('All');

  // ─── Computations ───
  const occupancy = computeOccupancyRate(ROOMS);
  const available = computeAvailableRooms(ROOMS);
  const arrivals = computeArrivalsToday(RESERVATIONS, TODAY);
  const departures = computeDeparturesToday(RESERVATIONS, TODAY);
  const revToday = computeRevenueToday(INVOICES, TODAY);
  const pending = computePendingInvoices(INVOICES);
  const avgDailyRate = useMemo(() => {
    const occ = ROOMS.filter(r => r.status === 'Occupied');
    return occ.length > 0 ? Math.round(occ.reduce((s, r) => s + r.rate, 0) / occ.length) : 0;
  }, []);
  const revPAR = ROOMS.length > 0 ? Math.round(INVOICES.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0) / ROOMS.length) : 0;

  const feed = filterActivityFeed(ACTIVITY_FEED, feedFilter);
  const upcoming = filterUpcomingCheckins(RESERVATIONS, TODAY);
  const floors = groupRoomsByFloor(ROOMS);
  const alerts = generateAlerts(ROOMS, MAINTENANCE_ISSUES, INVOICES);
  const revenue = computeRevenueSummary(INVOICES, TODAY);
  const billingHealth = computeBillingHealth(INVOICES);
  const hkCounts = computeHousekeepingCounts(HOUSEKEEPING);
  const mntSummary = computeMaintenanceSummary(MAINTENANCE_ISSUES);
  const staffGroups = groupStaffByRole(STAFF);
  const coverageGaps = detectCoverageGaps(STAFF, ['Front Desk', 'Housekeeping', 'Concierge', 'Security']);
  const vipGuests = identifyRepeatGuests(GUESTS);
  const unpaidGuests = identifyGuestsWithUnpaidBalances(GUESTS, INVOICES);

  const occupiedGuests: Record<string, string> = {};
  RESERVATIONS.filter(r => r.status === 'Checked-in').forEach(r => { occupiedGuests[r.room] = r.guest; });

  const roomTypeBreakdown = ['Standard', 'Deluxe', 'Suite'].map(type => {
    const rooms = ROOMS.filter(r => r.type === type);
    const occ = rooms.filter(r => r.status === 'Occupied').length;
    return { type, total: rooms.length, occupied: occ, rate: rooms.length > 0 ? Math.round((occ / rooms.length) * 100) : 0 };
  });

  return (
    <div className="dash-page animate-in">
      {/* ═══ HERO HEADER ═══ */}
      <div className="dash-hero">
        <div>
          <div className="dash-hero-title">Operations Intelligence</div>
          <div className="dash-hero-sub">Templesi Court Hotel · Wednesday, April 8, 2026 · Morning Shift</div>
          <div className="dash-hero-chips">
            <span className="dash-hero-chip"><Building2 size={12} /> {occupancy}% Occupancy</span>
            <span className="dash-hero-chip"><DoorOpen size={12} /> {available.count} Available</span>
            <span className="dash-hero-chip"><DollarSign size={12} /> ${revToday.toLocaleString()} Today</span>
          </div>
        </div>
        <div className="dash-hero-actions">
          <button className="dash-hero-btn dash-hero-btn-primary" onClick={() => navigate('/check-in-out')}>Check In</button>
          <button className="dash-hero-btn dash-hero-btn-ghost" onClick={() => navigate('/reservations')}><PlusCircle size={14} /> New Booking</button>
          <button className="dash-hero-btn dash-hero-btn-ghost" onClick={() => navigate('/rooms')}> Add Room</button>
          <button className="dash-hero-btn dash-hero-btn-ghost" onClick={() => navigate('/analytics')}><BarChart3 size={14} /> Analytics</button>
          <button className="dash-hero-btn dash-hero-btn-ghost"><Download size={14} /> Export</button>
        </div>
      </div>

      {/* ═══ 1. EXECUTIVE KPI ROW ═══ */}
      <div className="d-grid d-g8">
        {[
          { label: 'Occupancy', val: `${occupancy}%`, trend: '+8%', up: true, icon: <Building2 size={15}/>, bg: '#EEF2FF', fg: '#4F46E5', spark: SPARK_OCC, sparkColor: '#4F46E5' },
          { label: 'Available', val: available.count, trend: null, up: true, icon: <DoorOpen size={15}/>, bg: '#ECFDF5', fg: '#059669', sub: Object.entries(available.byType).map(([t,c])=>`${c} ${t.slice(0,3)}`).join(' · ') },
          { label: 'Arrivals', val: arrivals, trend: '+2', up: true, icon: <CalendarCheck size={15}/>, bg: '#EEF2FF', fg: '#4F46E5' },
          { label: 'Departures', val: departures, trend: null, up: true, icon: <CalendarMinus size={15}/>, bg: '#FFFBEB', fg: '#D97706' },
          { label: 'Revenue', val: `$${revToday.toLocaleString()}`, trend: '+14%', up: true, icon: <DollarSign size={15}/>, bg: '#F0FDF4', fg: '#16A34A', spark: SPARK_REV, sparkColor: '#16A34A' },
          { label: 'Pending', val: pending.count, trend: `-$${(pending.outstanding/1000).toFixed(1)}k`, up: false, icon: <FileWarning size={15}/>, bg: '#FFF1F2', fg: '#E11D48' },
          { label: 'ADR', val: `$${avgDailyRate}`, trend: '+$12', up: true, icon: <BedDouble size={15}/>, bg: '#ECFDF5', fg: '#059669', spark: SPARK_ADR, sparkColor: '#059669' },
          { label: 'RevPAR', val: `$${revPAR}`, trend: '+5%', up: true, icon: <TrendingUp size={15}/>, bg: '#EEF2FF', fg: '#4F46E5' },
        ].map(k => (
          <div key={k.label} className="d-kpi">
            <div className="d-kpi-row1">
              <div className="d-kpi-icon" style={{ background: k.bg, color: k.fg }}>{k.icon}</div>
              {k.trend && <span className={`d-kpi-trend ${k.up ? 'up' : 'down'}`}>{k.up ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>} {k.trend}</span>}
            </div>
            <div className="d-kpi-val">{k.val}</div>
            <div className="d-kpi-label">{k.label}</div>
            {k.sub && <div className="d-kpi-sub">{k.sub}</div>}
            {k.spark && <Spark data={k.spark} color={k.sparkColor} h={22} />}
          </div>
        ))}
      </div>

      {/* ═══ 2. REVENUE & OCCUPANCY ANALYSIS ═══ */}
      <div className="d-section">Revenue & Occupancy Analysis</div>
      <div className="d-grid d-g3">
        {/* Revenue Trend */}
        <div className="d-card d-card-primary">
          <div className="d-card-head"><div className="d-card-title"><DollarSign size={14}/> Revenue Trend</div><span className="d-badge d-badge-indigo">7-day</span></div>
          <div className="d-card-body">
            <div className="d-metrics d-g3" style={{ marginBottom: 12 }}>
              <div className="d-metric"><div className="d-metric-val">${revenue.revenueToday.toLocaleString()}</div><div className="d-metric-label">Today</div></div>
              <div className="d-metric"><div className="d-metric-val">${revenue.revenueMonth.toLocaleString()}</div><div className="d-metric-label">Month</div></div>
              <div className="d-metric"><div className="d-metric-val">${revenue.outstanding.toLocaleString()}</div><div className="d-metric-label">Outstanding</div></div>
            </div>
            <Spark data={SPARK_REV} color="#16A34A" h={40} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: 'var(--text-light)', fontWeight: 600 }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
        </div>

        {/* Occupancy Trend */}
        <div className="d-card d-card-primary">
          <div className="d-card-head"><div className="d-card-title"><Building2 size={14}/> Occupancy Trend</div><span className="d-badge d-badge-green">↑ trending</span></div>
          <div className="d-card-body">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{occupancy}%</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#059669' }}>+8% vs last week</span>
            </div>
            <Spark data={SPARK_OCC} color="#4F46E5" h={40} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: 'var(--text-light)', fontWeight: 600 }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
        </div>

        {/* Occupancy by Room Type */}
        <div className="d-card">
          <div className="d-card-head"><div className="d-card-title"><BedDouble size={14}/> By Room Type</div></div>
          <div className="d-card-body">
            <div className="d-bars">
              {roomTypeBreakdown.map(rt => (
                <div key={rt.type} className="d-bar-row">
                  <span className="d-bar-label">{rt.type}</span>
                  <div className="d-bar-track">
                    <div className="d-bar-fill" style={{ width: `${Math.max(rt.rate, 10)}%`, background: rt.type === 'Standard' ? '#4F46E5' : rt.type === 'Deluxe' ? '#059669' : '#D97706' }}>{rt.rate}%</div>
                  </div>
                  <span className="d-bar-val">{rt.occupied}/{rt.total}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
              Booking volume (7d): <Spark data={SPARK_BOOK} color="var(--primary)" h={18} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 3. ROOM STATUS + 4. ARRIVALS/DEPARTURES ═══ */}
      <div className="d-section">Room Status & Operations</div>
      <div className="d-grid d-g23">
        {/* Room Status Map */}
        <div className="d-card">
          <div className="d-card-head">
            <div className="d-card-title"><MapIcon size={14}/> Room Status Intelligence</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="d-badge">{ROOMS.length} rooms</span>
              <span className="d-badge-green d-badge">{available.count} available</span>
              <span className="d-badge-red d-badge">{ROOMS.filter(r=>r.status==='Maintenance').length} maintenance</span>
            </div>
          </div>
          <div className="d-card-body">
            {floors.map(({ floor, rooms }) => (
              <div key={floor} className="d-floor">
                <div className="d-floor-label">Floor {floor} · {rooms.length} rooms</div>
                <div className="d-rooms">
                  {rooms.map(room => {
                    const color = getRoomStatusColor(room.status);
                    const guest = occupiedGuests[room.id];
                    return (
                      <div key={room.id} className="d-room" style={{ background: `${color}10`, border: `1.5px solid ${color}25`, color }}>
                        <span>{room.id}</span>
                        {guest && <span className="d-room-sub">{getInitials(guest)}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="d-legend">
              {[{l:'Available',c:'#059669'},{l:'Occupied',c:'#E11D48'},{l:'Reserved',c:'#D97706'},{l:'Maintenance',c:'#94a3b8'}].map(s=>(
                <div key={s.l} style={{display:'flex',alignItems:'center',gap:4}}><div className="d-legend-dot" style={{background:s.c}}/>{s.l}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Arrivals & Departures */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="d-card">
            <div className="d-card-head"><div className="d-card-title"><CalendarCheck size={14}/> Arrivals Today</div><span className="d-badge-indigo d-badge">{arrivals}</span></div>
            <div className="d-card-body-compact">
              {upcoming.length === 0 && <div className="d-empty">No arrivals</div>}
              {upcoming.slice(0, 4).map(r => {
                const room = ROOMS.find(rm => rm.id === r.room);
                const av = getAvatarColor(r.guest);
                return (
                  <div key={r.id} className="d-item">
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{getInitials(r.guest)}</div>
                    <div className="d-item-info">
                      <div className="d-item-name">{r.guest}</div>
                      <div className="d-item-meta">{room?.type} {r.room} · {formatDateV2(r.checkin)}</div>
                    </div>
                    <span className="d-pill" style={{ background: r.status === 'Confirmed' ? '#EEF2FF' : '#FFFBEB', color: r.status === 'Confirmed' ? '#4F46E5' : '#D97706' }}>{r.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="d-card">
            <div className="d-card-head"><div className="d-card-title"><CalendarMinus size={14}/> Departures Today</div><span className="d-badge-amber d-badge">{departures}</span></div>
            <div className="d-card-body-compact">
              {RESERVATIONS.filter(r => r.checkout === TODAY && r.status === 'Checked-in').length === 0 && <div className="d-empty">No departures</div>}
              {RESERVATIONS.filter(r => r.checkout === TODAY && r.status === 'Checked-in').map(r => {
                const av = getAvatarColor(r.guest);
                return (
                  <div key={r.id} className="d-item">
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{getInitials(r.guest)}</div>
                    <div className="d-item-info">
                      <div className="d-item-name">{r.guest}</div>
                      <div className="d-item-meta">Room {r.room} · {r.paymentStatus}</div>
                    </div>
                    <span className="d-pill" style={{ background: r.paymentStatus === 'Paid' ? '#ECFDF5' : '#FFF1F2', color: r.paymentStatus === 'Paid' ? '#059669' : '#E11D48' }}>{r.paymentStatus}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 5. BILLING + 6. HOUSEKEEPING & MAINTENANCE ═══ */}
      <div className="d-section">Financial Health & Operations Readiness</div>
      <div className="d-grid d-g3">
        {/* Billing */}
        <div className="d-card d-card-success">
          <div className="d-card-head"><div className="d-card-title"><Receipt size={14}/> Billing Health</div><span className="d-badge d-badge-green">{billingHealth}% settled</span></div>
          <div className="d-card-body">
            <div className="d-donut-wrap">
              <div className="d-donut" style={{ background: `conic-gradient(#16A34A 0% ${billingHealth}%, #D97706 ${billingHealth}% 100%)` }}>
                <div className="d-donut-center">{billingHealth}%</div>
              </div>
              <div className="d-donut-legend">
                <div className="d-donut-legend-item"><div className="d-donut-legend-dot" style={{background:'#16A34A'}}/> Paid: ${revenue.revenueMonth.toLocaleString()}</div>
                <div className="d-donut-legend-item"><div className="d-donut-legend-dot" style={{background:'#D97706'}}/> Pending: ${revenue.outstanding.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 10.5, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 6 }}>Recent Payments</div>
            {revenue.recentPayments.slice(0, 3).map(i => (
              <div key={i.id} className="d-item">
                <span className="d-item-name" style={{ flex: 1 }}>{i.id}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{i.guest}</span>
                <span style={{ fontWeight: 700, fontSize: 12 }}>${i.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Housekeeping */}
        <div className="d-card">
          <div className="d-card-head"><div className="d-card-title"><BedDouble size={14}/> Housekeeping</div></div>
          <div className="d-card-body">
            <div className="d-metrics d-g4" style={{ marginBottom: 10 }}>
              {[{l:'Ready',v:hkCounts.ready,c:'#059669'},{l:'Awaiting',v:hkCounts.awaiting,c:'#D97706'},{l:'In Progress',v:hkCounts.inProgress,c:'#4F46E5'},{l:'Not Ready',v:hkCounts.notReady,c:'#E11D48'}].map(h=>(
                <div key={h.l} className="d-metric">
                  <div className="d-metric-val" style={{color:h.c}}>{h.v}</div>
                  <div className="d-metric-label">{h.l}</div>
                </div>
              ))}
            </div>
            {HOUSEKEEPING.filter(h => h.priority).map(h => (
              <div key={h.room} className="d-item">
                <div className="d-dot" style={{ background: '#E11D48' }} />
                <span className="d-item-msg">Room {h.room} — reserved but not ready</span>
                <span className="d-pill" style={{ background: '#FFF1F2', color: '#E11D48' }}>Priority</span>
              </div>
            ))}
            <div className="d-progress"><div className="d-progress-fill" style={{ width: `${HOUSEKEEPING.length > 0 ? (hkCounts.ready / HOUSEKEEPING.length) * 100 : 0}%`, background: '#059669' }} /></div>
            <div style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 4, fontWeight: 600 }}>{Math.round(HOUSEKEEPING.length > 0 ? (hkCounts.ready / HOUSEKEEPING.length) * 100 : 0)}% rooms ready</div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="d-card d-card-danger">
          <div className="d-card-head"><div className="d-card-title"><Wrench size={14}/> Maintenance</div><span className="d-badge d-badge-red">{mntSummary.openCount} open</span></div>
          <div className="d-card-body">
            {mntSummary.issues.map(i => (
              <div key={i.id} className="d-item">
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', minWidth: 32 }}>{i.room}</span>
                <span className="d-item-msg">{i.issue}</span>
                <span className="d-pill" style={{
                  background: i.priority === 'High' ? '#FFF1F2' : i.priority === 'Medium' ? '#FFFBEB' : '#F4F4F4',
                  color: i.priority === 'High' ? '#E11D48' : i.priority === 'Medium' ? '#D97706' : '#555',
                }}>{i.priority}</span>
                <span className="d-item-time">{i.reportedAt}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
              {mntSummary.blockedRooms} rooms blocked from sale
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 7. GUEST INTELLIGENCE + 8. ALERTS + 9. STAFF ═══ */}
      <div className="d-section">Guest Intelligence · Alerts · Staff Coverage</div>
      <div className="d-grid d-g3">
        {/* Guest Intelligence */}
        <div className="d-card">
          <div className="d-card-head"><div className="d-card-title"><Star size={14}/> Guest Intelligence</div></div>
          <div className="d-card-body">
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 6 }}>VIP / Repeat Guests</div>
            {vipGuests.map(g => {
              const av = getAvatarColor(g.name);
              return (
                <div key={g.id} className="d-item">
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, flexShrink: 0 }}>{getInitials(g.name)}</div>
                  <div className="d-item-info">
                    <div className="d-item-name">{g.name}</div>
                    <div className="d-item-meta">{g.stays} stays · ${g.totalSpent.toLocaleString()}</div>
                  </div>
                  <span className="d-pill" style={{ background: '#EEF2FF', color: '#4F46E5' }}>VIP</span>
                </div>
              );
            })}
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginTop: 10, marginBottom: 6 }}>Unpaid Balances</div>
            {unpaidGuests.slice(0, 3).map(g => (
              <div key={g.id} className="d-item">
                <div className="d-dot" style={{ background: '#E11D48' }} />
                <span className="d-item-msg">{g.name}</span>
                <span style={{ fontWeight: 700, fontSize: 11, color: '#E11D48' }}>${g.outstandingBalance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="d-card">
          <div className="d-card-head"><div className="d-card-title"><AlertTriangle size={14}/> Alerts & Exceptions</div>{alerts.length > 0 && <span className="d-badge-red d-badge">{alerts.length}</span>}</div>
          <div className="d-card-body">
            {alerts.length === 0 && <div className="d-empty">All clear — no operational alerts</div>}
            {alerts.slice(0, 8).map(a => (
              <div key={a.id} className="d-item">
                <div className="d-dot" style={{ background: a.severity === 'critical' ? '#E11D48' : '#D97706' }} />
                <span className="d-item-msg">{a.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Coverage */}
        <div className="d-card">
          <div className="d-card-head"><div className="d-card-title"><Users size={14}/> Staff Coverage</div><span className="d-badge">{STAFF.filter(s=>s.status==='On Duty').length}/{STAFF.length} on duty</span></div>
          <div className="d-card-body">
            <div className="d-bars">
              {Object.entries(staffGroups).map(([role, members]) => (
                <div key={role} className="d-bar-row">
                  <span className="d-bar-label">{role}</span>
                  <div className="d-bar-track">
                    <div className="d-bar-fill" style={{ width: `${Math.max((members.length / 3) * 100, 20)}%`, background: '#059669' }}>{members.length}</div>
                  </div>
                </div>
              ))}
            </div>
            {coverageGaps.length > 0 && coverageGaps.map(g => (
              <div key={g} className="d-item" style={{ marginTop: 6 }}>
                <div className="d-dot" style={{ background: '#E11D48' }} />
                <span className="d-item-msg" style={{ color: '#E11D48', fontWeight: 600 }}>No {g} on duty</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 10. FORECAST & ACTIVITY ═══ */}
      <div className="d-section">Forecast & Live Activity</div>
      <div className="d-grid d-g2">
        {/* Forecast */}
        <div className="d-card">
          <div className="d-card-head"><div className="d-card-title"><TrendingUp size={14}/> 7-Day Forecast</div><span className="d-badge-indigo d-badge">Projected</span></div>
          <div className="d-card-body">
            <div className="d-metrics d-g3" style={{ marginBottom: 12 }}>
              <div className="d-metric"><div className="d-metric-val">{Math.round(FORECAST_OCC.reduce((s,v)=>s+v,0)/FORECAST_OCC.length)}%</div><div className="d-metric-label">Avg Occupancy</div></div>
              <div className="d-metric"><div className="d-metric-val">${Math.round(FORECAST_REV.reduce((s,v)=>s+v,0)/1000)}k</div><div className="d-metric-label">Projected Rev</div></div>
              <div className="d-metric"><div className="d-metric-val">{Math.max(...FORECAST_OCC)}%</div><div className="d-metric-label">Peak Day</div></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 4 }}>Occupancy</div>
                <Spark data={FORECAST_OCC} color="#4F46E5" h={32} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 4 }}>Revenue</div>
                <Spark data={FORECAST_REV} color="#16A34A" h={32} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: 'var(--text-light)', fontWeight: 600 }}>
              {['Thu','Fri','Sat','Sun','Mon','Tue','Wed'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="d-card">
          <div className="d-card-head">
            <div className="d-card-title"><Clock size={14}/> Live Activity</div>
            <div className="d-filters">
              {['All','Check-ins','Check-outs','Payments','Maintenance'].map(c => (
                <button key={c} className={`d-filter ${feedFilter === c ? 'active' : 'inactive'}`} onClick={() => setFeedFilter(c)}>{c}</button>
              ))}
            </div>
          </div>
          <div className="d-card-body-compact">
            {feed.length === 0 && <div className="d-empty">No events</div>}
            {feed.map(e => (
              <div key={e.id} className="d-item">
                <div className="d-dot" style={{ background: FEED_COLORS[e.type] || '#aaa' }} />
                <span className="d-item-msg">{e.message}</span>
                <span className="d-item-time">{e.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;