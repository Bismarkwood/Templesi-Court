import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, CalendarCheck } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import { GUESTS } from '../../data/mockData';
import './AddGuestModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (guest: { name: string; email: string; phone: string }) => void;
}

const EMPTY = { name: '', email: '', phone: '', dob: '', nationality: '', address: '', language: 'English', idType: '', idNumber: '', smokingPref: '', bedPref: '', floorPref: '', dietaryNotes: '', specialRequests: '', emergencyName: '', emergencyPhone: '', emergencyRelation: '', frontDeskNotes: '' };

const AddGuestModal = ({ open, onClose, onSave }: Props) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) { setForm(EMPTY); setErrors({}); document.body.style.overflow = 'hidden'; }
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);

  const duplicate = useMemo(() => {
    if (!form.name.trim() && !form.email.trim() && !form.phone.trim()) return null;
    return GUESTS.find(g =>
      (form.email.trim() && g.email.toLowerCase() === form.email.trim().toLowerCase()) ||
      (form.phone.trim() && g.phone === form.phone.trim()) ||
      (form.name.trim().length > 3 && g.name.toLowerCase() === form.name.trim().toLowerCase())
    ) || null;
  }, [form.name, form.email, form.phone]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Guest name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className={`ag-backdrop ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="ag-modal" onClick={e => e.stopPropagation()}>
        <div className="ag-header">
          <div><div className="ag-title">Add New Guest</div><div className="ag-subtitle">Create a guest profile for bookings, check-in, and stay history tracking.</div></div>
          <button className="ag-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="ag-body">
          {/* Avatar + Name preview */}
          <div className="ag-avatar-area">
            <div className={`ag-avatar ${form.name.trim() ? 'has-name' : 'empty'}`}>{form.name.trim() ? getInitials(form.name) : '?'}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1E1E2D' }}>{form.name.trim() || 'New Guest'}</div>
              <div style={{ fontSize: 11, color: '#A0A4B8' }}>Guest profile will be available for reservations and check-in</div>
            </div>
          </div>

          {/* Duplicate detection */}
          {duplicate && (
            <div className="ag-duplicate">
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(duplicate.name).bg, color: getAvatarColor(duplicate.name).color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{getInitials(duplicate.name)}</div>
              <div>
                <div style={{ fontWeight: 700 }}>Possible existing guest: {duplicate.name}</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{duplicate.email} · {duplicate.phone} · {duplicate.stays} stays</div>
              </div>
              <div className="ag-duplicate-actions">
                <button className="ag-duplicate-btn">Use Existing</button>
              </div>
            </div>
          )}

          <div className="ag-two-col">
            {/* Left Column */}
            <div className="ag-col">
              <div className="ag-section-label indigo">Basic Information</div>
              <div className="ag-card ag-card-indigo">
                <div className="ag-field">
                  <label className="ag-label">Full Legal Name *</label>
                  <input className="ag-input" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  {errors.name && <span className="ag-error">{errors.name}</span>}
                </div>
                <div className="ag-row2">
                  <div className="ag-field">
                    <label className="ag-label">Email Address</label>
                    <input className="ag-input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    {errors.email && <span className="ag-error">{errors.email}</span>}
                  </div>
                  <div className="ag-field">
                    <label className="ag-label">Phone Number *</label>
                    <input className="ag-input" placeholder="+1 555-0100" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    {errors.phone && <span className="ag-error">{errors.phone}</span>}
                  </div>
                </div>
                <div className="ag-row3">
                  <div className="ag-field">
                    <label className="ag-label">Date of Birth</label>
                    <input className="ag-input" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                  </div>
                  <div className="ag-field">
                    <label className="ag-label">Nationality</label>
                    <input className="ag-input" placeholder="e.g. American" value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} />
                  </div>
                  <div className="ag-field">
                    <label className="ag-label">Language</label>
                    <select className="ag-select" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                      <option>English</option><option>French</option><option>Spanish</option><option>German</option><option>Arabic</option><option>Chinese</option>
                    </select>
                  </div>
                </div>
                <div className="ag-field">
                  <label className="ag-label">Address</label>
                  <input className="ag-input" placeholder="Street, City, Country" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
              </div>

              <div className="ag-section-label slate">Identification</div>
              <div className="ag-card ag-card-slate">
                <div className="ag-row2">
                  <div className="ag-field">
                    <label className="ag-label">ID Type</label>
                    <select className="ag-select" value={form.idType} onChange={e => setForm(f => ({ ...f, idType: e.target.value }))}>
                      <option value="">Select</option><option>Passport</option><option>National ID</option><option>Driver's License</option>
                    </select>
                  </div>
                  <div className="ag-field">
                    <label className="ag-label">ID / Passport Number</label>
                    <input className="ag-input" placeholder="Document number" value={form.idNumber} onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))} />
                  </div>
                </div>
                <span className="ag-hint">ID details help speed up check-in verification</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="ag-col">
              <div className="ag-section-label emerald">Preferences</div>
              <div className="ag-card ag-card-emerald">
                <div className="ag-row2">
                  <div className="ag-field">
                    <label className="ag-label">Smoking Preference</label>
                    <select className="ag-select" value={form.smokingPref} onChange={e => setForm(f => ({ ...f, smokingPref: e.target.value }))}>
                      <option value="">No preference</option><option>Non-smoking</option><option>Smoking</option>
                    </select>
                  </div>
                  <div className="ag-field">
                    <label className="ag-label">Bed Preference</label>
                    <select className="ag-select" value={form.bedPref} onChange={e => setForm(f => ({ ...f, bedPref: e.target.value }))}>
                      <option value="">No preference</option><option>King</option><option>Twin</option><option>Queen</option><option>Double</option>
                    </select>
                  </div>
                </div>
                <div className="ag-field">
                  <label className="ag-label">Dietary Notes</label>
                  <input className="ag-input" placeholder="Allergies, dietary requirements..." value={form.dietaryNotes} onChange={e => setForm(f => ({ ...f, dietaryNotes: e.target.value }))} />
                </div>
                <div className="ag-field">
                  <label className="ag-label">Special Requests</label>
                  <input className="ag-input" placeholder="Extra pillows, late checkout..." value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))} />
                </div>
              </div>

              <div className="ag-section-label rose">Emergency Contact</div>
              <div className="ag-card ag-card-rose">
                <div className="ag-field">
                  <label className="ag-label">Contact Name</label>
                  <input className="ag-input" placeholder="Full name" value={form.emergencyName} onChange={e => setForm(f => ({ ...f, emergencyName: e.target.value }))} />
                </div>
                <div className="ag-row2">
                  <div className="ag-field">
                    <label className="ag-label">Phone</label>
                    <input className="ag-input" placeholder="+1 555-0100" value={form.emergencyPhone} onChange={e => setForm(f => ({ ...f, emergencyPhone: e.target.value }))} />
                  </div>
                  <div className="ag-field">
                    <label className="ag-label">Relationship</label>
                    <select className="ag-select" value={form.emergencyRelation} onChange={e => setForm(f => ({ ...f, emergencyRelation: e.target.value }))}>
                      <option value="">Select</option><option>Spouse</option><option>Parent</option><option>Sibling</option><option>Friend</option><option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="ag-section-label amber">Internal Notes</div>
              <div className="ag-card ag-card-amber">
                <div className="ag-field">
                  <label className="ag-label">Front Desk Notes</label>
                  <textarea className="ag-textarea" rows={2} placeholder="Notes visible to front desk staff..." value={form.frontDeskNotes} onChange={e => setForm(f => ({ ...f, frontDeskNotes: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>

          {/* System Summary */}
          <div className="ag-full" style={{ marginTop: 20 }}>
            <div className="ag-section-label indigo">System Summary</div>
            <div className="ag-summary-grid">
              <div className="ag-summary-item"><div className="ag-summary-val">0</div><div className="ag-summary-label">Total Stays</div></div>
              <div className="ag-summary-item"><div className="ag-summary-val">$0</div><div className="ag-summary-label">Total Spent</div></div>
              <div className="ag-summary-item"><div className="ag-summary-val">New</div><div className="ag-summary-label">Guest Type</div></div>
              <div className="ag-summary-item"><div className="ag-summary-val">Today</div><div className="ag-summary-label">Guest Since</div></div>
            </div>
          </div>
        </div>

        <div className="ag-footer">
          <button className="ag-btn" onClick={onClose}>Cancel</button>
          <button className="ag-btn" onClick={handleSave}><UserPlus size={14} /> Create Guest</button>
          <button className="ag-btn ag-btn-primary" onClick={() => { handleSave(); }}><CalendarCheck size={14} /> Create & Reserve</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddGuestModal;