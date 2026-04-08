export const ROOMS = [
  { id: '101', type: 'Standard', rate: 120, capacity: 2, floor: 1, status: 'Available' },
  { id: '102', type: 'Standard', rate: 120, capacity: 2, floor: 1, status: 'Occupied' },
  { id: '103', type: 'Deluxe',   rate: 180, capacity: 3, floor: 1, status: 'Reserved' },
  { id: '104', type: 'Standard', rate: 120, capacity: 2, floor: 1, status: 'Available' },
  { id: '105', type: 'Suite',    rate: 280, capacity: 4, floor: 1, status: 'Maintenance' },
  { id: '201', type: 'Standard', rate: 120, capacity: 2, floor: 2, status: 'Occupied' },
  { id: '202', type: 'Deluxe',   rate: 180, capacity: 3, floor: 2, status: 'Available' },
  { id: '203', type: 'Standard', rate: 120, capacity: 2, floor: 2, status: 'Available' },
  { id: '204', type: 'Suite',    rate: 280, capacity: 4, floor: 2, status: 'Reserved' },
  { id: '205', type: 'Deluxe',   rate: 180, capacity: 3, floor: 2, status: 'Available' },
  { id: '301', type: 'Suite',    rate: 280, capacity: 4, floor: 3, status: 'Occupied' },
  { id: '302', type: 'Standard', rate: 120, capacity: 2, floor: 3, status: 'Available' },
  { id: '303', type: 'Deluxe',   rate: 180, capacity: 3, floor: 3, status: 'Available' },
  { id: '304', type: 'Standard', rate: 120, capacity: 2, floor: 3, status: 'Maintenance' },
  { id: '305', type: 'Suite',    rate: 280, capacity: 4, floor: 3, status: 'Available' },
];

export const GUESTS = [
  { id: 'g1', name: 'Alice Cooper',  email: 'alice@example.com',  phone: '+1 555-0101', stays: 6, totalSpent: 2450 },
  { id: 'g2', name: 'Bob Smith',     email: 'bob@example.com',    phone: '+1 555-0102', stays: 2, totalSpent: 450 },
  { id: 'g3', name: 'Charlie Day',   email: 'charlie@exam.com',   phone: '+1 555-0103', stays: 1, totalSpent: 180 },
  { id: 'g4', name: 'Emma Wilson',   email: 'emma@example.com',   phone: '+1 555-0104', stays: 4, totalSpent: 3200 },
  { id: 'g5', name: 'David Patel',   email: 'david@example.com',  phone: '+1 555-0105', stays: 3, totalSpent: 1650 },
  { id: 'g6', name: 'Sarah Connor',  email: 'sarah@example.com',  phone: '+1 555-0106', stays: 1, totalSpent: 0 },
];

export const INVOICES = [
  { id: 'INV-1001', guest: 'Alice Cooper', room: '102', amount: 360,  status: 'Pending', date: '2026-04-08' },
  { id: 'INV-1002', guest: 'Bob Smith',    room: '301', amount: 840,  status: 'Paid',    date: '2026-04-08' },
  { id: 'INV-1003', guest: 'David Patel',  room: '201', amount: 550,  status: 'Paid',    date: '2026-04-08' },
  { id: 'INV-1004', guest: 'Emma Wilson',  room: '105', amount: 1400, status: 'Pending', date: '2026-04-15' },
  { id: 'INV-1005', guest: 'Charlie Day',  room: '103', amount: 360,  status: 'Pending', date: '2026-04-10' },
  { id: 'INV-1006', guest: 'Sarah Connor', room: '405', amount: 920,  status: 'Pending', date: '2026-04-18' },
];


export const ACTIVITY_FEED = [
  { id: 1, type: 'check-in',    message: 'Alice Cooper checked into Room 102',       time: '10:45 AM' },
  { id: 2, type: 'payment',     message: 'Payment received for INV-1002 — $840',     time: '09:30 AM' },
  { id: 3, type: 'maintenance', message: 'Room 105 marked for maintenance — AC unit', time: '08:15 AM' },
  { id: 4, type: 'check-out',   message: 'Bob Smith checked out of Room 301',        time: '11:00 AM' },
  { id: 5, type: 'check-in',    message: 'David Patel checked into Room 201',        time: '02:15 PM' },
  { id: 6, type: 'payment',     message: 'Payment received for INV-1003 — $550',     time: '02:30 PM' },
  { id: 7, type: 'maintenance', message: 'Room 304 — leaking faucet reported',       time: '03:00 PM' },
  { id: 8, type: 'check-out',   message: 'Guest departed Room 203',                  time: '12:00 PM' },
];

export const RESERVATIONS = [
  { id: 'RES-001', guest: 'Alice Cooper', room: '102', checkin: '2026-04-06', checkout: '2026-04-09', total: 360,  status: 'Checked-in',  paymentStatus: 'Paid' },
  { id: 'RES-002', guest: 'Bob Smith',    room: '301', checkin: '2026-04-03', checkout: '2026-04-08', total: 840,  status: 'Checked-in',  paymentStatus: 'Paid' },
  { id: 'RES-003', guest: 'Charlie Day',  room: '103', checkin: '2026-04-08', checkout: '2026-04-12', total: 360,  status: 'Confirmed',   paymentStatus: 'Pending' },
  { id: 'RES-004', guest: 'Emma Wilson',  room: '105', checkin: '2026-04-08', checkout: '2026-04-20', total: 1400, status: 'Confirmed',   paymentStatus: 'Pending' },
  { id: 'RES-005', guest: 'David Patel',  room: '201', checkin: '2026-04-05', checkout: '2026-04-08', total: 550,  status: 'Checked-in',  paymentStatus: 'Paid' },
  { id: 'RES-006', guest: 'Sarah Connor', room: '302', checkin: '2026-04-18', checkout: '2026-04-22', total: 920,  status: 'Pending',     paymentStatus: 'Pending' },
  { id: 'RES-007', guest: 'Frank Torres', room: '202', checkin: '2026-04-08', checkout: '2026-04-10', total: 360,  status: 'Confirmed',   paymentStatus: 'Paid' },
];

export const STAFF = [
  { id: 'STF-01', name: 'James Wilson',  role: 'Front Desk',   shift: 'Morning',   status: 'On Duty',  rating: 4.9, email: 'james.w@grandvista.com' },
  { id: 'STF-02', name: 'Maria Garcia',  role: 'Housekeeping', shift: 'Afternoon', status: 'Off Duty', rating: 4.7, email: 'maria.g@grandvista.com' },
  { id: 'STF-03', name: 'Robert Chen',   role: 'Concierge',    shift: 'Morning',   status: 'On Duty',  rating: 4.8, email: 'robert.c@grandvista.com' },
  { id: 'STF-04', name: 'Sarah Miller',  role: 'Security',     shift: 'Night',     status: 'On Duty',  rating: 4.9, email: 'sarah.m@grandvista.com' },
  { id: 'STF-05', name: 'David Jones',   role: 'Front Desk',   shift: 'Afternoon', status: 'Off Duty', rating: 4.6, email: 'david.j@grandvista.com' },
  { id: 'STF-06', name: 'Lisa Park',     role: 'Housekeeping', shift: 'Morning',   status: 'On Duty',  rating: 4.5, email: 'lisa.p@grandvista.com' },
];

export const MAINTENANCE_ISSUES = [
  { id: 'MNT-001', room: '105', issue: 'AC unit not cooling',       priority: 'High' as const,   reportedAt: '08:00 AM', status: 'Open' },
  { id: 'MNT-002', room: '304', issue: 'Leaking bathroom faucet',   priority: 'Medium' as const, reportedAt: '09:30 AM', status: 'In Progress' },
  { id: 'MNT-003', room: '202', issue: 'TV remote not working',     priority: 'Low' as const,    reportedAt: '11:15 AM', status: 'Open' },
];

export const HOUSEKEEPING = [
  { room: '101', status: 'Ready',             priority: false },
  { room: '102', status: 'Awaiting Cleaning', priority: false },
  { room: '103', status: 'Not Ready',         priority: true },
  { room: '104', status: 'Ready',             priority: false },
  { room: '201', status: 'In Progress',       priority: false },
  { room: '202', status: 'Ready',             priority: false },
  { room: '203', status: 'Awaiting Cleaning', priority: false },
  { room: '204', status: 'Not Ready',         priority: true },
  { room: '301', status: 'Awaiting Cleaning', priority: false },
  { room: '302', status: 'Ready',             priority: false },
];