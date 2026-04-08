import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus } from 'lucide-react';
import { getInitials } from '../../utils/formatters';
import './AddGuestModal.css'; // reuse the same premium modal CSS

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (staff: { id: string; name: string; role: string; shift: string; status: string; rating: number; email: string }) => void;
  nextId: number;
}

const ROLES = ['Front Desk', 'Housekeeping', 'Concierge', 'Security', 'Maintenance', 'Restaurant', 'Management'];
const SHIFTS = ['Morning', 'Afternoon', 'Night'];

const EMPTY = { name: '', role: 'Front Desk', shift: 'Morning', email: '', phone: '', status: 'On Duty' };

const AddStaffModal = ({ open, onClose, onSave, nextId }: Props) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) { setForm(EMPTY); setErrors({}); document.body.style.overflow = 'hidden'; }
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: `STF-${String(nextId).padStart(2, '0')}`,
      name: form.name.trim(),
      role: form.role,
      shift: form.shift,
      status: form.status,
      rating: 0,
      email: form.email.trim(),
    });
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className={`ag-backdrop ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="ag-modal" style={{ width: 680 }} onClick={e => e.stopPropagation()}>
        {/* Gradient header */}
        <div className="ag-header">
          <div>
            <div className="ag-title">Add Employee</div>
            <div className="ag-subtitle">Create a new staff profile with role, shift, and contact details.</div>
          </div>
          <button className="ag-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="ag-body">
          {/* Avatar preview */}
          <div className="ag-avatar-area">
            <div className={`ag-avatar ${form.name.trim() ? 'has-name' : 'empty'}`}>{form.name.trim() ? getInitials(form.name) : '?'}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1E1E2D' }}>{form.name.trim() || 'New Employee'}</div>
              <div style={{ fontSize: 11, color: '#A0A4B8' }}>{form.role} · {form.shift} Shift</div>
            </div>
          </div>

          <div className="ag-two-col">
            <div className="ag-col">
              <div className="ag-section-label indigo">Personal Information</div>
              <div className="ag-card ag-card-indigo">
                <div className="ag-field">
                  <label className="ag-label">Full Name *</label>
                  <input className="ag-input" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  {errors.name && <span className="ag-error">{errors.name}</span>}
                </div>
                <div className="ag-field">
                  <label className="ag-label">Work Email *</label>
                  <input className="ag-input" type="email" placeholder="name@templesicourt.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  {errors.email && <span className="ag-error">{errors.email}</span>}
                </div>
                <div className="ag-field">
                  <label className="ag-label">Phone</label>
                  <input className="ag-input" placeholder="+1 555-0100" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="ag-col">
              <div className="ag-section-label emerald">Role & Schedule</div>
              <div className="ag-card ag-card-emerald">
                <div className="ag-field">
                  <label className="ag-label">Department / Role</label>
                  <select className="ag-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="ag-field">
                  <label className="ag-label">Assigned Shift</label>
                  <select className="ag-select" value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}>
                    {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="ag-field">
                  <label className="ag-label">Initial Status</label>
                  <select className="ag-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="On Duty">On Duty</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ag-footer">
          <button className="ag-btn" onClick={onClose}>Cancel</button>
          <button className="ag-btn ag-btn-primary" onClick={handleSave}><UserPlus size={14} /> Add Employee</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddStaffModal;