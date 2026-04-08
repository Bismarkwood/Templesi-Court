import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, ArrowRight, ArrowLeft, CreditCard } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { getInitials, getAvatarColor, formatDateV2 } from '../../utils/formatters';
import './AddReservationModal.css';

interface Props { open: boolean; onClose: () => void; }

const STEPS = ['Guest', 'Room', 'Dates & Pricing', 'Payment', 'Confirm'];

const AddReservationModal = ({ open, onClose }: Props) => {
  const { rooms, guests, addReservation } = useHotel();
  const [step, setStep] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [paymentOption, setPaymentOption] = useState<'none' | 'deposit' | 'full'>('none');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [depositAmount, setDepositAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableRooms = useMemo(() => rooms.filter(r => r.status === 'Available'), [rooms]);
  const room = rooms.find(r => r.id === selectedRoom);
  const nights = checkin && checkout ? Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000)) : 0;
  const total = room ? room.rate * nights : 0;
  const existingGuest = guests.find(g => g.name.toLowerCase() === guestName.toLowerCase().trim());

  useEffect(() => {
    if (open) { setStep(0); setGuestName(''); setGuestEmail(''); setGuestPhone(''); setSelectedRoom(''); setCheckin(''); setCheckout(''); setPaymentOption('none'); setDepositAmount(''); setErrors({}); document.body.style.overflow = 'hidden'; }
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0 && !guestName.trim()) e.guest = 'Guest name required';
    if (s === 1 && !selectedRoom) e.room = 'Select a room';
    if (s === 2) { if (!checkin) e.checkin = 'Required'; if (!checkout) e.checkout = 'Required'; if (checkin && checkout && checkout <= checkin) e.checkout = 'Must be after check-in'; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    const payStatus = paymentOption === 'full' ? 'Paid' : paymentOption === 'deposit' ? 'Partial' : 'Pending';
    addReservation({ guest: guestName.trim(), room: selectedRoom, checkin, checkout, total, status: 'Confirmed', paymentStatus: payStatus });
    setStep(4);
  };

  if (!open) return null;

  return createPortal(
    <div className={`ar-backdrop ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="ar-modal" onClick={e => e.stopPropagation()}>
        <div className="ar-header">
          <div><div className="ar-title">New Reservation</div><div className="ar-subtitle">Create a booking, assign a room, and capture payment.</div></div>
          <button className="ar-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="ar-stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`ar-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="ar-step-num">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className="ar-step-line" />}
            </div>
          ))}
        </div>

        <div className="ar-body">
          {/* Step 0: Guest */}
          {step === 0 && (
            <>
              <div className="ar-section-label">Guest Information</div>
              <div className="ar-card">
                <div className="ar-field">
                  <label className="ar-label">Guest Name</label>
                  <input className="ar-input" placeholder="Full name" value={guestName} onChange={e => setGuestName(e.target.value)} />
                  {errors.guest && <span className="ar-error">{errors.guest}</span>}
                </div>
                {existingGuest && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#EEF2FF', borderRadius: 10, fontSize: 12, color: '#4F46E5', fontWeight: 600 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(existingGuest.name).bg, color: getAvatarColor(existingGuest.name).color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{getInitials(existingGuest.name)}</div>
                    Existing guest · {existingGuest.stays} stays · ${existingGuest.totalSpent.toLocaleString()} spent
                  </div>
                )}
                <div className="ar-row2">
                  <div className="ar-field"><label className="ar-label">Email</label><input className="ar-input" placeholder="email@example.com" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} /></div>
                  <div className="ar-field"><label className="ar-label">Phone</label><input className="ar-input" placeholder="+1 555-0100" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} /></div>
                </div>
              </div>
            </>
          )}

          {/* Step 1: Room */}
          {step === 1 && (
            <>
              <div className="ar-section-label">Select Room · {availableRooms.length} available</div>
              {errors.room && <span className="ar-error" style={{ marginBottom: 8, display: 'block' }}>{errors.room}</span>}
              <div className="ar-room-options">
                {availableRooms.map(r => (
                  <div key={r.id} className={`ar-room-option ${selectedRoom === r.id ? 'selected' : ''}`} onClick={() => setSelectedRoom(r.id)}>
                    <div className="ar-room-option-num">{r.id}</div>
                    <div className="ar-room-option-info">
                      <div className="ar-room-option-type">{r.type}</div>
                      <div className="ar-room-option-meta">Floor {r.floor} · {r.capacity} guests · ${r.rate}/night</div>
                    </div>
                    {selectedRoom === r.id && <CheckCircle size={18} color="#4F46E5" />}
                  </div>
                ))}
                {availableRooms.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: '#A0A4B8', fontSize: 13 }}>No rooms available. All rooms are occupied, reserved, or under maintenance.</div>}
              </div>
            </>
          )}

          {/* Step 2: Dates & Pricing */}
          {step === 2 && (
            <>
              <div className="ar-two-col">
                <div>
                  <div className="ar-section-label">Stay Dates</div>
                  <div className="ar-card">
                    <div className="ar-row2">
                      <div className="ar-field"><label className="ar-label">Check-in</label><input className="ar-input" type="date" value={checkin} onChange={e => setCheckin(e.target.value)} />{errors.checkin && <span className="ar-error">{errors.checkin}</span>}</div>
                      <div className="ar-field"><label className="ar-label">Check-out</label><input className="ar-input" type="date" value={checkout} onChange={e => setCheckout(e.target.value)} />{errors.checkout && <span className="ar-error">{errors.checkout}</span>}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="ar-section-label">Pricing Summary</div>
                  <div className="ar-card">
                    <div className="ar-info-grid">
                      <div className="ar-info-card"><div className="ar-info-label">Room</div><div className="ar-info-value">{room?.type} {selectedRoom}</div></div>
                      <div className="ar-info-card"><div className="ar-info-label">Rate</div><div className="ar-info-value">${room?.rate}/night</div></div>
                      <div className="ar-info-card"><div className="ar-info-label">Nights</div><div className="ar-info-value">{nights || '—'}</div></div>
                      <div className="ar-info-card"><div className="ar-info-label">Total</div><div className="ar-info-value" style={{ fontSize: 18, color: '#4F46E5' }}>${total.toLocaleString()}</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}