import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, ArrowRight, ArrowLeft, AlertTriangle, CreditCard, Key } from 'lucide-react';
import { getInitials, getAvatarColor, formatDateV2 } from '../../utils/formatters';
import { ROOMS, GUESTS } from '../../data/mockData';
import './CheckInModal.css';

interface Reservation {
  id: string; guest: string; room: string; checkin: string; checkout: string;
  total: number; status: string; paymentStatus?: string;
}
interface Props {
  reservation: Reservation | null;
  onClose: () => void;
  onComplete: (resId: string) => void;
}

const STEPS = ['Confirm Reservation', 'Verify Guest', 'Stay & Room', 'Payment & Key', 'Complete'];

const ROOM_IMAGES: Record<string, string> = {
  Standard: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=300&fit=crop&q=80',
  Deluxe: 'https://images.unsplash.com/photo-1590490360182-c33d955e4c47?w=600&h=300&fit=crop&q=80',
  Suite: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=300&fit=crop&q=80',
};

const TYPE_AMENITIES: Record<string, string[]> = {
  Standard: ['Wi-Fi', 'TV', 'En-suite Bathroom'],
  Deluxe: ['Wi-Fi', 'TV', 'En-suite Bathroom', 'Mini-bar', 'Balcony'],
  Suite: ['Wi-Fi', 'TV', 'En-suite Bathroom', 'Mini-bar', 'Balcony', 'Jacuzzi', 'Desk', 'Safe'],
};

const CheckInModal = ({ reservation: res, onClose, onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [idVerified, setIdVerified] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [keyIssued, setKeyIssued] = useState(false);
  const [keyCount, setKeyCount] = useState('1');
  const [notes, setNotes] = useState('');
  const open = !!res;

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; setStep(0); setIdVerified(false); setBookingConfirmed(false); setKeyIssued(false); setNotes(''); }
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  if (!res) return null;
  const room = ROOMS.find(r => r.id === res.room);
  const guest = GUESTS.find(g => g.name === res.guest);
  const av = getAvatarColor(res.guest);
  const nights = Math.max(1, Math.round((new Date(res.checkout).getTime() - new Date(res.checkin).getTime()) / 86400000));
  const roomImage = ROOM_IMAGES[room?.type || 'Standard'];
  const amenities = TYPE_AMENITIES[room?.type || 'Standard'] || [];

  // Validation
  const isRoomMaintenance = room?.status === 'Maintenance';
  const isRoomOccupied = room?.status === 'Occupied';
  const isNotConfirmed = res.status !== 'Confirmed';
  const hasBlocker = isRoomMaintenance || isRoomOccupied || isNotConfirmed || !room;

  const canStep0 = !hasBlocker;
  const canStep1 = idVerified && bookingConfirmed;
  const canStep3 = keyIssued;

  return createPortal(
    <div className={`ci-backdrop ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="ci-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ci-header">
          <div>
            <div className="ci-title">Check-In</div>
            <div className="ci-subtitle">Verify guest, confirm room, capture arrival details</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ci-badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>{res.id}</span>
            <span className="ci-badge" style={{ background: '#F0F1F5', color: '#6B6F80' }}>Room {res.room}</span>
            <button className="ci-close" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        {/* Stepper */}
        <div className="ci-stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`ci-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="ci-step-num">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className="ci-step-line" />}
            </div>
          ))}
        </div>

        <div className="ci-body">
          {/* ═══ Step 0: Confirm Reservation ═══ */}
          {step === 0 && (
            <>
              {hasBlocker && (
                <div className="ci-blocker">
                  <AlertTriangle size={18} />
                  <div>
                    {isNotConfirmed && <div>This reservation is not in Confirmed status. Current: <strong>{res.status}</strong></div>}
                    {isRoomMaintenance && <div>Room {res.room} is under maintenance and cannot be checked into.</div>}
                    {isRoomOccupied && <div>Room {res.room} is still occupied. Complete checkout first.</div>}
                    {!room && <div>No room assigned to this reservation.</div>}
                  </div>
                </div>
              )}
              <div className="ci-two-col">
                <div>
                  <div className="ci-section-label">Reservation</div>
                  <div className="ci-info-grid">
                    <div className="ci-info-card"><div className="ci-info-label">ID</div><div className="ci-info-value">{res.id}</div></div>
                    <div className="ci-info-card"><div className="ci-info-label">Guest</div><div className="ci-info-value">{res.guest}</div></div>
                    <div className="ci-info-card"><div className="ci-info-label">Check-in</div><div className="ci-info-value">{formatDateV2(res.checkin)}</div></div>
                    <div className="ci-info-card"><div className="ci-info-label">Check-out</div><div className="ci-info-value">{formatDateV2(res.checkout)}</div></div>
                    <div className="ci-info-card"><div className="ci-info-label">Nights</div><div className="ci-info-value">{nights}</div></div>
                    <div className="ci-info-card"><div className="ci-info-label">Total</div><div className="ci-info-value">${res.total.toLocaleString()}</div></div>
                  </div>
                </div>
                <div>
                  <div className="ci-section-label">Room</div>
                  <div className="ci-info-card" style={{ marginBottom: 12 }}>
                    <div className="ci-info-label">Room {res.room} · {room?.type}</div>
                    <div className="ci-info-value">Floor {room?.floor} · {room?.capacity} guests · ${room?.rate}/night</div>
                    <div className="ci-info-sub" style={{ color: isRoomMaintenance ? '#D97706' : '#059669' }}>Status: {room?.status || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ Step 1: Verify Guest ═══ */}
          {step === 1 && (
            <>
              <div className="ci-two-col">
                <div>
                  <div className="ci-guest-hero">
                    <div className="ci-guest-avatar" style={{ background: av.bg, color: av.color }}>{getInitials(res.guest)}</div>
                    <div>
                      <div className="ci-guest-name">{res.guest}</div>
                      {guest && <div className="ci-guest-meta">{guest.email} · {guest.phone}</div>}
                      {guest && guest.stays >= 3 && <span className="ci-badge" style={{ background: '#EEF2FF', color: '#4F46E5', marginTop: 6 }}>VIP · {guest.stays} stays</span>}
                    </div>
                  </div>
                  {guest && (
                    <div className="ci-info-grid" style={{ marginTop: 16 }}>
                      <div className="ci-info-card"><div className="ci-info-label">Total Stays</div><div className="ci-info-value">{guest.stays}</div></div>
                      <div className="ci-info-card"><div className="ci-info-label">Total Spent</div><div className="ci-info-value">${guest.totalSpent.toLocaleString()}</div></div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="ci-section-label">Verification</div>
                  <label className="ci-checkbox-row"><input type="checkbox" className="ci-checkbox" checked={idVerified} onChange={e => setIdVerified(e.target.checked)} /> Guest identity verified (ID / passport)</label>
                  <label className="ci-checkbox-row"><input type="checkbox" className="ci-checkbox" checked={bookingConfirmed} onChange={e => setBookingConfirmed(e.target.checked)} /> Booking details confirmed with guest</label>
                  <div className="ci-field" style={{ marginTop: 12 }}>
                    <label className="ci-label">ID Type (optional)</label>
                    <select className="ci-select"><option>Passport</option><option>National ID</option><option>Driver's License</option></select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ Step 2: Stay & Room ═══ */}
          {step === 2 && (
            <>
              <div className="ci-room-hero" style={{ backgroundImage: `url(${roomImage})` }}>
                <div className="ci-room-hero-overlay" />
                <div className="ci-room-hero-content">
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{room?.type} Room {res.room}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>Floor {room?.floor} · {room?.capacity} guests · ${room?.rate}/night</div>
                </div>
              </div>
              <div className="ci-info-grid" style={{ marginTop: 16 }}>
                <div className="ci-info-card"><div className="ci-info-label">Check-in</div><div className="ci-info-value">{formatDateV2(res.checkin)}</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Check-out</div><div className="ci-info-value">{formatDateV2(res.checkout)}</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Nights</div><div className="ci-info-value">{nights}</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Total</div><div className="ci-info-value">${res.total.toLocaleString()}</div></div>
              </div>
              <div className="ci-section-label" style={{ marginTop: 16 }}>Amenities</div>
              <div className="ci-amenities">{amenities.map(a => <span key={a} className="ci-amenity">{a}</span>)}</div>
            </>
          )}

          {/* ═══ Step 3: Payment & Key ═══ */}
          {step === 3 && (
            <>
              <div className="ci-two-col">
                <div>
                  <div className="ci-section-label">Payment Method</div>
                  <div className="ci-payment-options">
                    {['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Company Account'].map(m => (
                      <button key={m} type="button" className={`ci-payment-option ${paymentMethod === m ? 'active' : ''}`} onClick={() => setPaymentMethod(m)}>
                        <CreditCard size={14} /> {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="ci-section-label">Key Issuance</div>
                  <label className="ci-checkbox-row"><input type="checkbox" className="ci-checkbox" checked={keyIssued} onChange={e => setKeyIssued(e.target.checked)} /> <Key size={14} /> Room key / card issued to guest</label>
                  <div className="ci-field" style={{ marginTop: 8 }}>
                    <label className="ci-label">Number of Keys</label>
                    <input className="ci-input" type="number" min="1" max="4" value={keyCount} onChange={e => setKeyCount(e.target.value)} />
                  </div>
                  <div className="ci-field" style={{ marginTop: 8 }}>
                    <label className="ci-label">Arrival Notes</label>
                    <input className="ci-input" placeholder="Special requests, late arrival, etc." value={notes} onChange={e => setNotes(e.target.value)} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ Step 4: Complete ═══ */}
          {step === 4 && (
            <div className="ci-success">
              <div className="ci-success-icon"><CheckCircle size={32} /></div>
              <div className="ci-success-title">Check-In Complete</div>
              <div className="ci-success-sub">
                {res.guest} has been checked into <strong>Room {res.room}</strong>.<br />
                {nights} night{nights > 1 ? 's' : ''} · ${res.total.toLocaleString()} · {paymentMethod}<br />
                Invoice created automatically.
              </div>
              <div className="ci-success-summary">
                <div className="ci-info-grid" style={{ marginTop: 16 }}>
                  <div className="ci-info-card"><div className="ci-info-label">Guest</div><div className="ci-info-value">{res.guest}</div></div>
                  <div className="ci-info-card"><div className="ci-info-label">Room</div><div className="ci-info-value">{room?.type} {res.room}</div></div>
                  <div className="ci-info-card"><div className="ci-info-label">Payment</div><div className="ci-info-value">{paymentMethod}</div></div>
                  <div className="ci-info-card"><div className="ci-info-label">Keys</div><div className="ci-info-value">{keyCount} issued</div></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ci-footer">
          <div>{step > 0 && step < 4 && <button className="ci-btn" onClick={() => setStep(s => s - 1)}><ArrowLeft size={14} /> Back</button>}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ci-btn" onClick={onClose}>{step === 4 ? 'Done' : 'Cancel'}</button>
            {step === 0 && <button className="ci-btn ci-btn-primary" disabled={!canStep0} onClick={() => setStep(1)}>Continue <ArrowRight size={14} /></button>}
            {step === 1 && <button className="ci-btn ci-btn-primary" disabled={!canStep1} onClick={() => setStep(2)}>Continue <ArrowRight size={14} /></button>}
            {step === 2 && <button className="ci-btn ci-btn-primary" onClick={() => setStep(3)}>Continue <ArrowRight size={14} /></button>}
            {step === 3 && <button className="ci-btn ci-btn-success" disabled={!canStep3} onClick={() => { onComplete(res.id); setStep(4); }}>Complete Check-In <CheckCircle size={14} /></button>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CheckInModal;