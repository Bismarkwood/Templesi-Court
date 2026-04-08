import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit3, CalendarCheck, Star, DollarSign, Users } from 'lucide-react';
import { getInitials, formatDateV2 } from '../../utils/formatters';
import { RESERVATIONS, INVOICES } from '../../data/mockData';
import './GuestModal.css';

interface Guest { id: string; name: string; email: string; phone: string; stays: number; totalSpent: number; }
interface Props { guest: Guest | null; onClose: () => void; }

const GuestModal = ({ guest, onClose }: Props) => {
  const [tab, setTab] = useState('Overview');
  const open = !!guest;

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; setTab('Overview'); }
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);

  if (!guest) return null;
  const isVip = guest.stays >= 3;
  const guestReservations = useMemo(() => RESERVATIONS.filter(r => r.guest === guest.name), [guest.name]);
  const guestInvoices = useMemo(() => INVOICES.filter(i => i.guest === guest.name), [guest.name]);
  const unpaidBalance = guestInvoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const upcomingRes = guestReservations.filter(r => r.status === 'Confirmed' || r.status === 'Pending');
  const tabs = ['Overview', 'Reservations', 'Billing', 'Preferences'];

  return createPortal(
    <div className={`gm-backdrop ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="gm-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="gm-header">
          <span className="gm-header-name">{guest.name}</span>
          <div className="gm-header-badges">
            {isVip && <span className="gm-badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}><Star size={12} /> VIP</span>}
            <span className="gm-badge" style={{ background: '#F0F1F5', color: '#6B6F80' }}>{guest.stays} stays</span>
            {unpaidBalance > 0 && <span className="gm-badge" style={{ background: '#FFF1F2', color: '#E11D48' }}>${unpaidBalance} due</span>}
          </div>
          <div className="gm-header-actions">
            <button className="gm-header-btn"><Edit3 size={14} /> Edit Guest</button>
          </div>
          <button className="gm-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Hero */}
        <div className="gm-hero">
          <div className="gm-hero-avatar" style={{ background: 'rgba(255,255,255,0.2)' }}>{getInitials(guest.name)}</div>
          <div className="gm-hero-info">
            <div className="gm-hero-name">{guest.name}</div>
            <div className="gm-hero-meta">{guest.email || 'No email'} · {guest.phone || 'No phone'}</div>
            <div className="gm-hero-stats">
              <span className="gm-hero-stat"><Users size={12} /> {guest.stays} stays</span>
              <span className="gm-hero-stat"><DollarSign size={12} /> ${guest.totalSpent.toLocaleString()} spent</span>
              {upcomingRes.length > 0 && <span className="gm-hero-stat"><CalendarCheck size={12} /> {upcomingRes.length} upcoming</span>}
              {isVip && <span className="gm-hero-stat" style={{ background: 'rgba(255,255,255,0.3)' }}><Star size={12} /> VIP Guest</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="gm-tabs">
          {tabs.map(t => <button key={t} className={`gm-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {/* Body */}
        <div className="gm-body">
          {tab === 'Overview' && (
            <>
              <div className="gm-info-grid">
                <div className="gm-info-card"><div className="gm-info-label">Full Name</div><div className="gm-info-value">{guest.name}</div></div>
                <div className="gm-info-card"><div className="gm-info-label">Email</div><div className="gm-info-value">{guest.email || '—'}</div></div>
                <div className="gm-info-card"><div className="gm-info-label">Phone</div><div className="gm-info-value">{guest.phone || '—'}</div></div>
                <div className="gm-info-card"><div className="gm-info-label">Guest ID</div><div className="gm-info-value">{guest.id}</div></div>
              </div>

              <div className="gm-section-title">Loyalty & Spend</div>
              <div className="gm-info-grid">
                <div className="gm-info-card"><div className="gm-info-label">Total Stays</div><div className="gm-info-value">{guest.stays}</div><div className="gm-info-sub">{isVip ? 'VIP — repeat guest' : guest.stays === 0 ? 'New guest' : 'Regular guest'}</div></div>
                <div className="gm-info-card"><div className="gm-info-label">Total Spent</div><div className="gm-info-value">${guest.totalSpent.toLocaleString()}</div><div className="gm-info-sub">{guest.stays > 0 ? `$${Math.round(guest.totalSpent / guest.stays)} avg per stay` : 'No stays yet'}</div></div>
                <div className="gm-info-card"><div className="gm-info-label">Upcoming</div><div className="gm-info-value">{upcomingRes.length}</div><div className="gm-info-sub">{upcomingRes.length > 0 ? 'Active bookings' : 'No upcoming'}</div></div>
                <div className="gm-info-card"><div className="gm-info-label">Outstanding</div><div className="gm-info-value" style={{ color: unpaidBalance > 0 ? '#E11D48' : '#059669' }}>{unpaidBalance > 0 ? `$${unpaidBalance.toLocaleString()}` : '$0'}</div><div className="gm-info-sub">{unpaidBalance > 0 ? 'Unpaid balance' : 'All settled'}</div></div>
              </div>

              {guestReservations.length > 0 && (
                <>
                  <div className="gm-section-title">Recent Reservations</div>
                  {guestReservations.slice(0, 3).map(r => (
                    <div key={r.id} className="gm-res-item">
                      <span className="gm-res-id">{r.id}</span>
                      <div className="gm-res-info">
                        <div className="gm-res-guest">Room {r.room}</div>
                        <div className="gm-res-meta">{formatDateV2(r.checkin)} → {formatDateV2(r.checkout)} · ${r.total.toLocaleString()}</div>
                      </div>
                      <span className="gm-badge" style={{ background: r.status === 'Checked-in' ? '#ECFDF5' : r.status === 'Confirmed' ? '#EEF2FF' : '#F0F1F5', color: r.status === 'Checked-in' ? '#059669' : r.status === 'Confirmed' ? '#4F46E5' : '#6B6F80' }}>{r.status}</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {tab === 'Reservations' && (
            <>
              <div className="gm-section-title">All Reservations · {guestReservations.length}</div>
              {guestReservations.length === 0 && <div className="gm-empty">No reservations found for this guest.</div>}
              {guestReservations.map(r => (
                <div key={r.id} className="gm-res-item">
                  <span className="gm-res-id">{r.id}</span>
                  <div className="gm-res-info">
                    <div className="gm-res-guest">Room {r.room}</div>
                    <div className="gm-res-meta">{formatDateV2(r.checkin)} → {formatDateV2(r.checkout)} · ${r.total.toLocaleString()} · {r.paymentStatus}</div>
                  </div>
                  <span className="gm-badge" style={{ background: r.status === 'Checked-in' ? '#ECFDF5' : r.status === 'Confirmed' ? '#EEF2FF' : r.status === 'Checked-out' ? '#F0F1F5' : '#FFFBEB', color: r.status === 'Checked-in' ? '#059669' : r.status === 'Confirmed' ? '#4F46E5' : r.status === 'Checked-out' ? '#6B6F80' : '#D97706' }}>{r.status}</span>
                </div>
              ))}
            </>
          )}

          {tab === 'Billing' && (
            <>
              <div className="gm-info-grid">
                <div className="gm-info-card"><div className="gm-info-label">Lifetime Spend</div><div className="gm-info-value">${guest.totalSpent.toLocaleString()}</div></div>
                <div className="gm-info-card"><div className="gm-info-label">Outstanding</div><div className="gm-info-value" style={{ color: unpaidBalance > 0 ? '#E11D48' : '#059669' }}>{unpaidBalance > 0 ? `$${unpaidBalance.toLocaleString()}` : '$0'}</div></div>
              </div>
              <div className="gm-section-title">Invoices · {guestInvoices.length}</div>
              {guestInvoices.length === 0 && <div className="gm-empty">No invoices found.</div>}
              {guestInvoices.map(i => (
                <div key={i.id} className="gm-detail-row">
                  <span className="gm-detail-label" style={{ fontFamily: 'monospace' }}>{i.id}</span>
                  <span style={{ flex: 1, textAlign: 'center', color: '#8B8FA3' }}>Room {i.room} · {formatDateV2(i.date)}</span>
                  <span style={{ fontWeight: 700 }}>${i.amount.toLocaleString()}</span>
                  <span className="gm-badge" style={{ background: i.status === 'Paid' ? '#ECFDF5' : '#FFFBEB', color: i.status === 'Paid' ? '#059669' : '#D97706', marginLeft: 8 }}>{i.status}</span>
                </div>
              ))}
            </>
          )}

          {tab === 'Preferences' && (
            <>
              <div className="gm-section-title">Guest Preferences</div>
              <div className="gm-info-grid">
                <div className="gm-info-card"><div className="gm-info-label">Smoking</div><div className="gm-info-value">Non-smoking</div></div>
                <div className="gm-info-card"><div className="gm-info-label">Bed Preference</div><div className="gm-info-value">King</div></div>
                <div className="gm-info-card"><div className="gm-info-label">Floor Preference</div><div className="gm-info-value">High floor</div></div>
                <div className="gm-info-card"><div className="gm-info-label">Room Type</div><div className="gm-info-value">Deluxe or Suite</div></div>
              </div>
              <div className="gm-section-title">Notes</div>
              <div className="gm-info-card" style={{ marginBottom: 0 }}>
                <div className="gm-info-label">Front Desk Notes</div>
                <div className="gm-info-value" style={{ fontSize: 13, fontWeight: 500, color: '#4A4D5E' }}>
                  {isVip ? 'VIP guest — ensure premium welcome amenities are prepared.' : 'No special notes recorded.'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="gm-footer">
          <button className="gm-btn" onClick={onClose}>Close</button>
          <button className="gm-btn"><CalendarCheck size={14} /> Create Reservation</button>
          <button className="gm-btn gm-btn-primary"><Edit3 size={14} /> Edit Guest</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GuestModal;