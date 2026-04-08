import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  ROOMS as INIT_ROOMS, GUESTS as INIT_GUESTS, INVOICES as INIT_INVOICES,
  RESERVATIONS as INIT_RESERVATIONS, ACTIVITY_FEED as INIT_FEED,
  STAFF, MAINTENANCE_ISSUES, HOUSEKEEPING,
} from '../data/mockData';

// ─── Types ───
export type Room = typeof INIT_ROOMS[0];
export type Guest = typeof INIT_GUESTS[0];
export type Invoice = typeof INIT_INVOICES[0];
export type Reservation = typeof INIT_RESERVATIONS[0];
export type FeedEntry = typeof INIT_FEED[0];

interface HotelState {
  rooms: Room[];
  guests: Guest[];
  invoices: Invoice[];
  reservations: Reservation[];
  feed: FeedEntry[];
  // Read-only shared data
  staff: typeof STAFF;
  maintenanceIssues: typeof MAINTENANCE_ISSUES;
  housekeeping: typeof HOUSEKEEPING;
  // Actions
  addRoom: (room: Room) => void;
  updateRoom: (updated: Room) => void;
  addReservation: (res: Omit<Reservation, 'id'>) => Reservation;
  checkIn: (resId: string) => boolean;
  checkOut: (resId: string) => boolean;
  markInvoicePaid: (invId: string) => void;
  addFeedEntry: (type: string, message: string) => void;
}


const HotelContext = createContext<HotelState | null>(null);

export const useHotel = () => {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used within HotelProvider');
  return ctx;
};

let nextFeedId = INIT_FEED.length + 1;
let nextResNum = INIT_RESERVATIONS.length + 1;
let nextInvNum = INIT_INVOICES.length + 1;

const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

export const HotelProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([...INIT_ROOMS]);
  const [guests, setGuests] = useState<Guest[]>([...INIT_GUESTS]);
  const [invoices, setInvoices] = useState<Invoice[]>([...INIT_INVOICES]);
  const [reservations, setReservations] = useState<Reservation[]>([...INIT_RESERVATIONS]);
  const [feed, setFeed] = useState<FeedEntry[]>([...INIT_FEED]);

  const addFeedEntry = useCallback((type: string, message: string) => {
    setFeed(prev => [{ id: nextFeedId++, type, message, time: now() }, ...prev]);
  }, []);

  // ─── Add Room ───
  const addRoom = useCallback((room: Room) => {
    setRooms(prev => [...prev, room]);
    addFeedEntry('maintenance', `Room ${room.id} added to inventory`);
  }, [addFeedEntry]);

  const updateRoom = useCallback((updated: Room) => {
    setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
  }, []);

  // ─── Add Reservation ───
  // Creates reservation, sets room to Reserved, auto-creates guest if missing
  const addReservation = useCallback((data: Omit<Reservation, 'id'>): Reservation => {
    const id = `RES-${String(nextResNum++).padStart(3, '0')}`;
    const res: Reservation = { ...data, id };

    setReservations(prev => [...prev, res]);

    // Room → Reserved
    setRooms(prev => prev.map(r => r.id === data.room ? { ...r, status: 'Reserved' } : r));

    // Auto-create guest if not exists
    setGuests(prev => {
      if (prev.some(g => g.name === data.guest)) return prev;
      return [...prev, { id: `g${prev.length + 1}`, name: data.guest, email: '', phone: '', stays: 0, totalSpent: 0 }];
    });

    addFeedEntry('check-in', `Reservation ${id} created for ${data.guest}`);
    return res;
  }, [addFeedEntry]);


  // ─── Check In ───
  // Reservation Confirmed → Checked-in, Room Reserved → Occupied, Invoice auto-created
  const checkIn = useCallback((resId: string): boolean => {
    const res = reservations.find(r => r.id === resId);
    if (!res || res.status !== 'Confirmed') return false;

    const room = rooms.find(r => r.id === res.room);
    if (!room || room.status === 'Maintenance') return false;

    // Update reservation
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'Checked-in', paymentStatus: r.paymentStatus } : r));

    // Room → Occupied
    setRooms(prev => prev.map(r => r.id === res.room ? { ...r, status: 'Occupied' } : r));

    // Auto-create invoice
    const invId = `INV-${String(nextInvNum++).padStart(4, '0')}`;
    setInvoices(prev => [...prev, { id: invId, guest: res.guest, room: res.room, amount: res.total, status: 'Pending', date: new Date().toISOString().split('T')[0] }]);

    // Update guest stays
    setGuests(prev => prev.map(g => g.name === res.guest ? { ...g, stays: g.stays + 1 } : g));

    addFeedEntry('check-in', `${res.guest} checked into Room ${res.room}`);
    return true;
  }, [reservations, rooms, addFeedEntry]);

  // ─── Check Out ───
  // Reservation Checked-in → Checked-out, Room Occupied → Available
  const checkOut = useCallback((resId: string): boolean => {
    const res = reservations.find(r => r.id === resId);
    if (!res || res.status !== 'Checked-in') return false;

    // Update reservation
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'Checked-out' } : r));

    // Room → Available
    setRooms(prev => prev.map(r => r.id === res.room ? { ...r, status: 'Available' } : r));

    // Update guest total spent
    setGuests(prev => prev.map(g => g.name === res.guest ? { ...g, totalSpent: g.totalSpent + res.total } : g));

    addFeedEntry('check-out', `${res.guest} checked out of Room ${res.room}`);
    return true;
  }, [reservations, addFeedEntry]);

  // ─── Mark Invoice Paid ───
  const markInvoicePaid = useCallback((invId: string) => {
    setInvoices(prev => prev.map(i => i.id === invId ? { ...i, status: 'Paid' } : i));
    const inv = invoices.find(i => i.id === invId);
    if (inv) addFeedEntry('payment', `Invoice ${invId} marked paid — $${inv.amount}`);
  }, [invoices, addFeedEntry]);

  return (
    <HotelContext.Provider value={{
      rooms, guests, invoices, reservations, feed,
      staff: STAFF, maintenanceIssues: MAINTENANCE_ISSUES, housekeeping: HOUSEKEEPING,
      addRoom, updateRoom, addReservation, checkIn, checkOut, markInvoicePaid, addFeedEntry,
    }}>
      {children}
    </HotelContext.Provider>
  );
};