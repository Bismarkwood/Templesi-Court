// Pure helper functions for Dashboard command center computations

type Room = { id: string; type: string; status: string; floor: number; [k: string]: unknown };
type Reservation = { id: string; guest: string; room: string; checkin: string; checkout: string; status: string; paymentStatus: string; [k: string]: unknown };
type Invoice = { id: string; guest: string; amount: number; status: string; date: string; [k: string]: unknown };
type ActivityEntry = { id: number; type: string; message: string; time: string };
type MaintenanceIssue = { id: string; room: string; issue: string; priority: string; reportedAt: string; status: string };
type HousekeepingEntry = { room: string; status: string; priority: boolean };
type StaffMember = { id: string; name: string; role: string; shift: string; status: string; [k: string]: unknown };
type Guest = { id: string; name: string; stays: number; totalSpent: number; [k: string]: unknown };

// --- KPI Computations ---

export const computeOccupancyRate = (rooms: Room[]) => {
  if (rooms.length === 0) return 0;
  const occupied = rooms.filter(r => r.status === 'Occupied').length;
  return Math.round((occupied / rooms.length) * 100);
};

export const computeAvailableRooms = (rooms: Room[]) => {
  const available = rooms.filter(r => r.status === 'Available');
  const byType: Record<string, number> = {};
  available.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; });
  return { count: available.length, byType };
};

export const computeArrivalsToday = (reservations: Reservation[], today: string) =>
  reservations.filter(r => r.checkin === today && (r.status === 'Confirmed' || r.status === 'Pending')).length;

export const computeDeparturesToday = (reservations: Reservation[], today: string) =>
  reservations.filter(r => r.checkout === today && r.status === 'Checked-in').length;


export const computeRevenueToday = (invoices: Invoice[], today: string) =>
  invoices.filter(i => i.status === 'Paid' && i.date === today).reduce((sum, i) => sum + i.amount, 0);

export const computePendingInvoices = (invoices: Invoice[]) => {
  const pending = invoices.filter(i => i.status === 'Pending');
  return { count: pending.length, outstanding: pending.reduce((sum, i) => sum + i.amount, 0) };
};

// --- Activity Feed ---

const FILTER_MAP: Record<string, string> = {
  'Check-ins': 'check-in',
  'Check-outs': 'check-out',
  'Payments': 'payment',
  'Maintenance': 'maintenance',
};

export const filterActivityFeed = (entries: ActivityEntry[], category: string) => {
  if (category === 'All') return entries;
  const mapped = FILTER_MAP[category];
  return mapped ? entries.filter(e => e.type === mapped) : entries;
};

// --- Check-in Panel ---

export const filterUpcomingCheckins = (reservations: Reservation[], today: string) =>
  reservations.filter(r => (r.status === 'Confirmed' || r.status === 'Pending') && r.checkin >= today);

// --- Room Status Map ---

export const groupRoomsByFloor = (rooms: Room[]) => {
  const groups: Record<number, Room[]> = {};
  rooms.forEach(r => {
    if (!groups[r.floor]) groups[r.floor] = [];
    groups[r.floor].push(r);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([floor, rooms]) => ({ floor: Number(floor), rooms }));
};

export const getRoomStatusColor = (status: string) => {
  switch (status) {
    case 'Available': return '#059669';
    case 'Occupied': return '#E11D48';
    case 'Reserved': return '#D97706';
    case 'Maintenance': return '#94a3b8';
    default: return '#AAAAAA';
  }
};

// --- Housekeeping ---

export const computeHousekeepingCounts = (entries: HousekeepingEntry[]) => {
  const counts = { ready: 0, awaiting: 0, inProgress: 0, notReady: 0 };
  entries.forEach(e => {
    if (e.status === 'Ready') counts.ready++;
    else if (e.status === 'Awaiting Cleaning') counts.awaiting++;
    else if (e.status === 'In Progress') counts.inProgress++;
    else if (e.status === 'Not Ready') counts.notReady++;
  });
  return counts;
};

// --- Maintenance ---

export const computeMaintenanceSummary = (issues: MaintenanceIssue[]) => {
  const open = issues.filter(i => i.status === 'Open' || i.status === 'In Progress');
  return { openCount: open.length, blockedRooms: open.length, issues: open };
};

// --- Revenue ---

export const computeRevenueSummary = (invoices: Invoice[], today: string) => {
  const paid = invoices.filter(i => i.status === 'Paid');
  const pending = invoices.filter(i => i.status === 'Pending');
  return {
    revenueToday: paid.filter(i => i.date === today).reduce((s, i) => s + i.amount, 0),
    revenueMonth: paid.reduce((s, i) => s + i.amount, 0),
    outstanding: pending.reduce((s, i) => s + i.amount, 0),
    recentPayments: paid,
    outstandingInvoices: pending,
  };
};

export const computeBillingHealth = (invoices: Invoice[]) => {
  const total = invoices.reduce((s, i) => s + i.amount, 0);
  if (total === 0) return 0;
  const paid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  return Math.round((paid / total) * 100);
};

// --- Staff ---

export const groupStaffByRole = (staff: StaffMember[]) => {
  const onDuty = staff.filter(s => s.status === 'On Duty');
  const groups: Record<string, StaffMember[]> = {};
  onDuty.forEach(s => {
    if (!groups[s.role]) groups[s.role] = [];
    groups[s.role].push(s);
  });
  return groups;
};

export const detectCoverageGaps = (staff: StaffMember[], knownRoles: string[]) => {
  const onDutyRoles = new Set(staff.filter(s => s.status === 'On Duty').map(s => s.role));
  return knownRoles.filter(role => !onDutyRoles.has(role));
};

// --- Guest Intelligence ---

export const identifyRepeatGuests = (guests: Guest[]) =>
  guests.filter(g => g.stays >= 3);

export const identifyGuestsWithUnpaidBalances = (guests: Guest[], invoices: Invoice[]) => {
  const pendingGuests = new Set(invoices.filter(i => i.status === 'Pending').map(i => i.guest));
  return guests.filter(g => pendingGuests.has(g.name)).map(g => {
    const balance = invoices.filter(i => i.guest === g.name && i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
    return { ...g, outstandingBalance: balance };
  });
};

// --- Alerts ---

export interface Alert {
  id: string;
  severity: 'critical' | 'warning';
  message: string;
  reference: string;
}

export const generateAlerts = (rooms: Room[], issues: MaintenanceIssue[], invoices: Invoice[]): Alert[] => {
  const alerts: Alert[] = [];
  const openIssueRooms = new Set(issues.filter(i => i.status === 'Open' || i.status === 'In Progress').map(i => i.room));

  // Critical: reserved rooms under maintenance
  rooms.filter(r => r.status === 'Reserved' && openIssueRooms.has(r.id)).forEach(r => {
    alerts.push({ id: `alert-res-mnt-${r.id}`, severity: 'critical', message: `Reserved room ${r.id} has open maintenance issue`, reference: r.id });
  });

  // Critical: maintenance rooms blocking inventory
  rooms.filter(r => r.status === 'Maintenance').forEach(r => {
    alerts.push({ id: `alert-mnt-${r.id}`, severity: 'warning', message: `Room ${r.id} under maintenance — reducing available inventory`, reference: r.id });
  });

  // Warning: pending invoices
  invoices.filter(i => i.status === 'Pending').forEach(i => {
    alerts.push({ id: `alert-inv-${i.id}`, severity: 'warning', message: `Invoice ${i.id} for ${i.guest} — $${i.amount} outstanding`, reference: i.id });
  });

  return alerts.sort((a, b) => (a.severity === 'critical' ? -1 : 1) - (b.severity === 'critical' ? -1 : 1));
};