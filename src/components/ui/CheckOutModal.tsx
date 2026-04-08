import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, ArrowRight, ArrowLeft, Receipt } from 'lucide-react';
import { formatDateV2 } from '../../utils/formatters';
import { ROOMS, INVOICES } from '../../data/mockData';
import './CheckInModal.css'; // reuse same CSS

interface Reservation {
  id: string; guest: string; room: string; checkin: string; checkout: string;
  total: number; status: string; paymentStatus?: string;
}
interface Props {
  reservation: Reservation | null;
  onClose: () => void;
  onComplete: (resId: string) => void;
}

const STEPS = ['Review Stay', 'Review Charges', 'Settle Invoice', 'Complete'];

const CheckOutModal = ({ reservation: res, onClose, onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [markPaid, setMarkPaid] = useState(false);
  const [keyReturned, setKeyReturned] = useState(false);
  const open = !!res;

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; setStep(0); setMarkPaid(false); setKeyReturned(false); }
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
  const invoice = INVOICES.find(i => i.guest === res.guest);
  const nights = Math.max(1, Math.round((new Date(res.checkout).getTime() - new Date(res.checkin).getTime()) / 86400000));
  const isPaid = res.paymentStatus === 'Paid' || markPaid;

  return createPortal(
    <div className={`ci-backdrop ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="ci-modal" onClick={e => e.stopPropagation()}>
        <div className="ci-header">
          <div><div className="ci-title">Check-Out Guest</div><div className="ci-subtitle">{res.guest} · Room {res.room} · {res.id}</div></div>
          <button className="ci-close" onClick={onClose}><X size={18} /></button>
        </div>

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
          {step === 0 && (
            <>
              <div className="ci-info-grid">
                <div className="ci-info-card"><div className="ci-info-label">Guest</div><div className="ci-info-value">{res.guest}</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Room</div><div className="ci-info-value">{room?.type} {res.room}</div><div className="ci-info-sub">Floor {room?.floor}</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Check-in</div><div className="ci-info-value">{formatDateV2(res.checkin)}</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Check-out</div><div className="ci-info-value">{formatDateV2(res.checkout)}</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Nights</div><div className="ci-info-value">{nights}</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Rate</div><div className="ci-info-value">${room?.rate}/night</div></div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="ci-info-grid">
                <div className="ci-info-card"><div className="ci-info-label">Room Charges</div><div className="ci-info-value">${res.total.toLocaleString()}</div><div className="ci-info-sub">{nights} × ${room?.rate}</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Extras</div><div className="ci-info-value">$0</div><div className="ci-info-sub">No extras</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Total Due</div><div className="ci-info-value" style={{ color: '#1E1E2D', fontSize: 18 }}>${res.total.toLocaleString()}</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Payment Status</div><div className="ci-info-value" style={{ color: isPaid ? '#059669' : '#D97706' }}>{isPaid ? 'Paid' : 'Pending'}</div></div>
              </div>
              {invoice && (
                <div style={{ padding: 14, background: '#F7F8FC', borderRadius: 12, fontSize: 13 }}>
                  <div style={{ fontWeight: 700, color: '#1E1E2D', marginBottom: 6 }}>Invoice: {invoice.id}</div>
                  <div style={{ color: '#8B8FA3' }}>Amount: ${invoice.amount.toLocaleString()} · Status: {invoice.status} · Date: {formatDateV2(invoice.date)}</div>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="ci-info-grid">
                <div className="ci-info-card"><div className="ci-info-label">Amount Due</div><div className="ci-info-value" style={{ fontSize: 20 }}>${res.total.toLocaleString()}</div></div>
                <div className="ci-info-card"><div className="ci-info-label">Status</div><div className="ci-info-value" style={{ color: isPaid ? '#059669' : '#D97706' }}>{isPaid ? 'Settled' : 'Outstanding'}</div></div>
              </div>
              {!isPaid && (
                <label className="ci-checkbox-row">
                  <input type="checkbox" className="ci-checkbox" checked={markPaid} onChange={e => setMarkPaid(e.target.checked)} />
                  Mark invoice as paid
                </label>
              )}
              <label className="ci-checkbox-row">
                <input type="checkbox" className="ci-checkbox" checked={keyReturned} onChange={e => setKeyReturned(e.target.checked)} />
                Room key returned by guest
              </label>
            </>
          )}

          {step === 3 && (
            <div className="ci-success">
              <div className="ci-success-icon"><CheckCircle size={32} /></div>
              <div className="ci-success-title">Check-Out Complete</div>
              <div className="ci-success-sub">{res.guest} has checked out of Room {res.room}.<br />Room returned to available. Housekeeping notified.</div>
            </div>
          )}
        </div>

        <div className="ci-footer">
          <div>{step > 0 && step < 3 && <button className="ci-btn" onClick={() => setStep(s => s - 1)}><ArrowLeft size={14} /> Back</button>}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ci-btn" onClick={onClose}>{step === 3 ? 'Close' : 'Cancel'}</button>
            {step < 2 && <button className="ci-btn ci-btn-primary" onClick={() => setStep(s => s + 1)}>Continue <ArrowRight size={14} /></button>}
            {step === 2 && <button className="ci-btn ci-btn-success" disabled={!isPaid || !keyReturned} onClick={() => { onComplete(res.id); setStep(3); }}>Complete Check-Out <CheckCircle size={14} /></button>}
            {step === 3 && <button className="ci-btn"><Receipt size={14} /> Print Receipt</button>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CheckOutModal;