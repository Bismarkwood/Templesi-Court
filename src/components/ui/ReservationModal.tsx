import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit3, Calendar, DollarSign, Users, BedDouble, Clock, CheckCircle, UserCheck, LogOut, Receipt, Eye } from 'lucide-react';
import { getInitials, getAvatarColor, formatDateV2 } from '../../utils/formatters';
import { ROOMS, GUESTS, INVOICES } from '../../data/mockData';
import './ReservationModal.css';

interface Reservation {
  id: string; guest: string; room: string; checkin: string; checkout: string;
  total: number; status: string; paymentStatus?: string;
}
interface Props {
  reservation: Reservation | null;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'Confirmed': { bg: '#EEF2FF', color: '#4F46E5' },
  'Checked-in': { bg: '#ECFDF5', color: '#059669' },
  'Checked-out': { bg: '#F0F1F5', color: '#6B6F80' },
  'Pending': { bg: '#FFFBEB', color: '#D97706' },
};

const ReservationModal = ({ reservation: res, onClose }: Props) => {
  const [tab, setTab] = useState('Overview');
  const open = !!res;

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  useEffect(() => { if (res) setTab('Overview'); }, [res]);

  if (!res) return null;
  const st = STATUS_COLORS[res.status] || STATUS_COLORS.Confirmed;
  const room = ROOMS.find(r => r.id === res.room);
  const guest = GUESTS.find(g => g.name === res.guest);
  const invoice = INVOICES.find(i => i.guest === res.guest);
  const av = getAvatarColor(res.guest);
  const nights = Math.max(1, Math.round((new Date(res.checkout).getTime() - new Date(res.checkin).getTime()) / 86400000));
  const tabs = ['Overview', 'Guest', 'Stay & Room', 'Billing', 'Activity'];

  return createPortal(
    <div className={`res-modal-backdrop ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="res-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="res-modal-header">
          <span className="res-modal-id">{res.id}</span>
          <div className="res-modal-badges">
            <span className="res-modal-badge" style={{ background: st.bg, color: st.color }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} /> {res.status}
            </span>
            <span className="res-modal-badge" style={{ background: '#F0F1F5', color: '#6B6F80' }}>Room {res.room}</span>
            <span className="res-modal-badge" style={{ background: '#F0F1F5', color: '#6B6F80' }}>{nights} night{nights > 1 ? 's' : ''}</span>
          </div>
          <div className="res-modal-header-actions">
            <button className="res-modal-header-btn"><Edit3 size={14} /> Edit</button>
          </div>
          <button className="res-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Hero */}
        <div className="res-modal-hero">
          <div className="res-modal-hero-avatar" style={{ background: 'rgba(255,255,255,0.2)' }}>{getInitials(res.guest)}</div>
          <div className="res-modal-hero-info">
            <div className="res-modal-hero-name">{res.guest}</div>
            <div className="res-modal-hero-meta">{formatDateV2(res.checkin)} → {formatDateV2(res.checkout)} · {nights} nights · ${res.total.toLocaleString()}</div>
            <div className="res-modal-hero-chips">
              <span className="res-modal-hero-chip"><BedDouble size={12} /> {room?.type || 'Room'} {res.room}</span>
              <span className="res-modal-hero-chip"><DollarSign size={12} /> ${res.total.toLocaleString()}</span>
              <span className="res-modal-hero-chip"><Calendar size={12} /> {nights} nights</span>
              {res.paymentStatus && <span className="res-modal-hero-chip" style={{ background: res.paymentStatus === 'Paid' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)' }}>{res.paymentStatus}</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="res-modal-tabs">
          {tabs.map(t => <button key={t} className={`res-modal-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {/* Body */}
        <div className="res-modal-body">
          {tab === 'Overview' && (
            <>
              <div className="res-info-grid">
                <div className="res-info-card"><div className="res-info-label">Reservation ID</div><div className="res-info-value">{res.id}</div></div>
                <div className="res-info-card"><div className="res-info-label">Guest</div><div className="res-info-value">{res.guest}</div></div>
                <div className="res-info-card"><div className="res-info-label">Room</div><div className="res-info-value">{room?.type || ''} {res.room}</div><div className="res-info-sub">Floor {room?.floor} · {room?.capacity} guests · ${room?.rate}/night</div></div>
                <div className="res-info-card"><div className="res-info-label">Total Amount</div><div className="res-info-value">${res.total.toLocaleString()}</div><div className="res-info-sub">{nights} nights × ${room?.rate || 0}</div></div>
                <div className="res-info-card"><div className="res-info-label">Check-in</div><div className="res-info-value">{formatDateV2(res.checkin)}</div></div>
                <div className="res-info-card"><div className="res-info-label">Check-out</div><div className="res-info-value">{formatDateV2(res.checkout)}</div></div>
              </div>
              <div className="res-section-title">Status</div>
              <div className="res-ops-card">
                <div className="res-detail-row"><span className="res-detail-label">Booking Status</span><span className="res-detail-value" style={{ color: st.color }}>{res.status}</span></div>
                <div className="res-detail-row"><span className="res-detail-label">Payment</span><span className="res-detail-value" style={{ color: res.paymentStatus === 'Paid' ? '#059669' : '#D97706' }}>{res.paymentStatus || 'Unknown'}</span></div>
                <div className="res-detail-row"><span className="res-detail-label">Room Status</span><span className="res-detail-value">{room?.status || 'Unknown'}</span></div>
              </div>
            </>
          )}

          {tab === 'Guest' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>{getInitials(res.guest)}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1E1E2D' }}>{res.guest}</div>
                  {guest && <div style={{ fontSize: 12, color: '#8B8FA3' }}>{guest.email} · {guest.phone}</div>}
                </div>
                {guest && guest.stays >= 3 && <span className="res-modal-badge" style={{ background: '#EEF2FF', color: '#4F46E5', marginLeft: 'auto' }}>VIP</span>}
              </div>
              {guest && (
                <div className="res-info-grid">
                  <div className="res-info-card"><div className="res-info-label">Total Stays</div><div className="res-info-value">{guest.stays}</div></div>
                  <div className="res-info-card"><div className="res-info-label">Total Spent</div><div className="res-info-value">${guest.totalSpent.toLocaleString()}</div></div>
                  <div className="res-info-card"><div className="res-info-label">Email</div><div className="res-info-value" style={{ fontSize: 13 }}>{guest.email}</div></div>
                  <div className="res-info-card"><div className="res-info-label">Phone</div><div className="res-info-value" style={{ fontSize: 13 }}>{guest.phone}</div></div>
                </div>
              )}
              {!guest && <div style={{ textAlign: 'center', padding: 32, color: '#A0A4B8', fontSize: 13 }}>Guest profile not found in directory.</div>}
            </>
          )}

          {tab === 'Stay & Room' && (
            <>
              <div className="res-info-grid">
                <div className="res-info-card"><div className="res-info-label">Room Number</div><div className="res-info-value">{res.room}</div></div>
                <div className="res-info-card"><div className="res-info-label">Room Type</div><div className="res-info-value">{room?.type || 'Unknown'}</div></div>
                <div className="res-info-card"><div className="res-info-label">Floor</div><div className="res-info-value">Floor {room?.floor}</div></div>
                <div className="res-info-card"><div className="res-info-label">Rate / Night</div><div className="res-info-value">${room?.rate}</div></div>
                <div className="res-info-card"><div className="res-info-label">Capacity</div><div className="res-info-value">{room?.capacity} guests</div></div>
                <div className="res-info-card"><div className="res-info-label">Room Status</div><div className="res-info-value" style={{ color: room?.status === 'Available' ? '#059669' : room?.status === 'Maintenance' ? '#D97706' : '#1E1E2D' }}>{room?.status}</div></div>
              </div>
              {room?.status === 'Maintenance' && (
                <div className="res-ops-card" style={{ borderLeft: '3px solid #D97706' }}>
                  <div className="res-ops-title" style={{ color: '#D97706' }}>⚠ Room under maintenance</div>
                  <div style={{ fontSize: 12, color: '#8B8FA3' }}>This room may not be ready for check-in. Consider reassigning.</div>
                </div>
              )}
            </>
          )}

          {tab === 'Billing' && (
            <>
              <div className="res-info-grid">
                <div className="res-info-card"><div className="res-info-label">Total Amount</div><div className="res-info-value">${res.total.toLocaleString()}</div></div>
                <div className="res-info-card"><div className="res-info-label">Payment Status</div><div className="res-info-value" style={{ color: res.paymentStatus === 'Paid' ? '#059669' : '#D97706' }}>{res.paymentStatus || 'Unknown'}</div></div>
              </div>
              {invoice && (
                <>
                  <div className="res-section-title">Invoice</div>
                  <div className="res-ops-card">
                    <div className="res-detail-row"><span className="res-detail-label">Invoice ID</span><span className="res-detail-value">{invoice.id}</span></div>
                    <div className="res-detail-row"><span className="res-detail-label">Amount</span><span className="res-detail-value">${invoice.amount.toLocaleString()}</span></div>
                    <div className="res-detail-row"><span className="res-detail-label">Status</span><span className="res-detail-value" style={{ color: invoice.status === 'Paid' ? '#059669' : '#D97706' }}>{invoice.status}</span></div>
                    <div className="res-detail-row"><span className="res-detail-label">Date</span><span className="res-detail-value">{formatDateV2(invoice.date)}</span></div>
                  </div>
                </>
              )}
              {!invoice && <div style={{ textAlign: 'center', padding: 32, color: '#A0A4B8', fontSize: 13 }}>No invoice generated yet. Invoice is created on check-in.</div>}
            </>
          )}

          {tab === 'Activity' && (
            <>
              <div className="res-section-title">Booking Timeline</div>
              <div className="res-timeline">
                {[
                  { event: 'Reservation created', time: formatDateV2(res.checkin), done: true },
                  { event: `Room ${res.room} assigned`, time: formatDateV2(res.checkin), done: true },
                  ...(res.status === 'Checked-in' || res.status === 'Checked-out' ? [
                    { event: 'Guest checked in', time: formatDateV2(res.checkin), done: true },
                    { event: 'Invoice generated', time: formatDateV2(res.checkin), done: true },
                  ] : []),
                  ...(res.paymentStatus === 'Paid' ? [
                    { event: 'Payment received', time: 'Today', done: true },
                  ] : []),
                  ...(res.status === 'Checked-out' ? [
                    { event: 'Guest checked out', time: formatDateV2(res.checkout), done: true },
                  ] : []),
                  ...(res.status === 'Confirmed' || res.status === 'Pending' ? [
                    { event: 'Awaiting check-in', time: formatDateV2(res.checkin), done: false },
                  ] : []),
                ].map((item, i) => (
                  <div key={i} className="res-timeline-item">
                    <div className={`res-timeline-dot ${item.done ? 'done' : ''}`} />
                    <div className="res-timeline-content">
                      <div className="res-timeline-event">{item.event}</div>
                      <div className="res-timeline-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="res-modal-footer">
          <button className="res-modal-btn" onClick={onClose}>Close</button>
          {res.status === 'Confirmed' && (
            <>
              <button className="res-modal-btn"><Edit3 size={14} /> Edit</button>
              <button className="res-modal-btn res-modal-btn-primary"><UserCheck size={14} /> Check In</button>
            </>
          )}
          {res.status === 'Pending' && (
            <>
              <button className="res-modal-btn"><Edit3 size={14} /> Edit</button>
              <button className="res-modal-btn res-modal-btn-primary"><CheckCircle size={14} /> Confirm</button>
            </>
          )}
          {res.status === 'Checked-in' && (
            <>
              <button className="res-modal-btn"><Receipt size={14} /> Invoice</button>
              <button className="res-modal-btn res-modal-btn-primary"><LogOut size={14} /> Check Out</button>
            </>
          )}
          {res.status === 'Checked-out' && (
            <button className="res-modal-btn"><Eye size={14} /> View Invoice</button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReservationModal;