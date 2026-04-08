import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit3, Users, Wrench, CheckCircle, UserCheck, LogOut, Calendar, Eye, Save } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import './RoomModal.css';

interface RoomData {
  id: string; type: string; rate: number; capacity: number; floor: number; status: string;
}
interface RoomModalProps {
  room: RoomData | null;
  onClose: () => void;
  onSave?: (updated: RoomData) => void;
  guestName?: string;
  hkStatus?: string;
  mntIssue?: string;
  amenities?: string[];
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Available: { bg: '#ECFDF5', color: '#059669' },
  Occupied: { bg: '#FFF1F2', color: '#E11D48' },
  Reserved: { bg: '#EEF2FF', color: '#4F46E5' },
  Maintenance: { bg: '#FFFBEB', color: '#D97706' },
};

const ALL_AMENITIES = ['Wi-Fi','TV','Air Conditioning','En-suite Bathroom','Mini-bar','Balcony','Desk','Safe','Refrigerator','Jacuzzi','Coffee Maker','Smart TV'];
const ROOM_IMAGES: Record<string, string> = {
  Standard: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=400&fit=crop&q=80',
  Deluxe: 'https://images.unsplash.com/photo-1590490360182-c33d955e4c47?w=1200&h=400&fit=crop&q=80',
  Suite: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=400&fit=crop&q=80',
};

const RoomModal = ({ room, onClose, onSave, guestName, hkStatus, mntIssue, amenities = [] }: RoomModalProps) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ type: '', rate: '', capacity: '', floor: '', status: '', bedConfig: '', view: '', amenities: [] as string[], notes: '' });
  const [toast, setToast] = useState('');
  const open = !!room;

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (editing) setEditing(false); else onClose(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, editing]);

  useEffect(() => { if (room) { setActiveTab('Overview'); setEditing(false); } }, [room]);

  const startEdit = () => {
    if (!room) return;
    setEditForm({ type: room.type, rate: String(room.rate), capacity: String(room.capacity), floor: String(room.floor), status: room.status, bedConfig: '', view: '', amenities: [...amenities], notes: '' });
    setEditing(true);
  };

  const toggleAmenity = (a: string) => setEditForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }));

  const handleSave = () => {
    if (!room || !onSave) return;
    onSave({ ...room, type: editForm.type, rate: Number(editForm.rate), capacity: Number(editForm.capacity), floor: Number(editForm.floor), status: editForm.status });
    setEditing(false);
    setToast(`Room ${room.id} updated successfully`);
    setTimeout(() => setToast(''), 3000);
  };

  if (!room) return null;
  const st = STATUS_COLORS[room.status] || STATUS_COLORS.Available;
  const heroImage = ROOM_IMAGES[editing ? editForm.type : room.type] || ROOM_IMAGES.Standard;
  const tabs = ['Overview', 'Housekeeping', 'Maintenance'];

  return createPortal(
    <div className={`room-modal-backdrop ${open ? 'open' : ''}`} onClick={() => { if (editing) setEditing(false); else onClose(); }}>
      <div className="room-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="room-modal-header">
          <span className="room-modal-room-num">{editing ? `Edit Room ${room.id}` : room.id}</span>
          <div className="room-modal-badges">
            <span className="room-modal-badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>{editing ? editForm.type : room.type}</span>
            <span className="room-modal-badge" style={{ background: st.bg, color: st.color }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} /> {editing ? editForm.status : room.status}
            </span>
            {editing && <span className="room-modal-badge" style={{ background: '#FFFBEB', color: '#D97706' }}>Editing</span>}
          </div>
          <div className="room-modal-header-actions">
            {!editing && <button className="room-modal-header-btn" onClick={startEdit}><Edit3 size={14} /> Edit Room</button>}
            {editing && <button className="room-modal-header-btn" onClick={() => setEditing(false)}><Eye size={14} /> View Mode</button>}
          </div>
          <button className="room-modal-close" onClick={() => { if (editing) setEditing(false); else onClose(); }}><X size={18} /></button>
        </div>

        {/* Hero */}
        <div className="room-modal-hero" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="room-modal-hero-overlay" />
          <div className="room-modal-hero-content">
            <div className="room-modal-hero-title">{editing ? editForm.type : room.type} Room · Floor {editing ? editForm.floor : room.floor}</div>
            <div className="room-modal-hero-sub">${editing ? editForm.rate : room.rate}/night · {editing ? editForm.capacity : room.capacity} guests max</div>
          </div>
        </div>

        {/* Body */}
        {!editing ? (
          <>
            {/* Tabs */}
            <div className="room-modal-tabs">
              {tabs.map(t => (
                <button key={t} className={`room-modal-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
              ))}
            </div>
            <div className="room-modal-body">
              {activeTab === 'Overview' && (
                <>
                  <div className="room-modal-info-grid">
                    <div className="room-modal-info-card"><div className="room-modal-info-label">Room Number</div><div className="room-modal-info-value">{room.id}</div></div>
                    <div className="room-modal-info-card"><div className="room-modal-info-label">Room Type</div><div className="room-modal-info-value">{room.type}</div><div className="room-modal-info-sub">{room.capacity} guest capacity</div></div>
                    <div className="room-modal-info-card"><div className="room-modal-info-label">Rate / Night</div><div className="room-modal-info-value">${room.rate}</div></div>
                    <div className="room-modal-info-card"><div className="room-modal-info-label">Floor</div><div className="room-modal-info-value">Floor {room.floor}</div></div>
                  </div>
                  {amenities.length > 0 && (
                    <>
                      <div className="room-modal-section-title">Amenities</div>
                      <div className="room-modal-amenities">{amenities.map(a => <span key={a} className="room-modal-amenity">{a}</span>)}</div>
                    </>
                  )}
                  {room.status === 'Occupied' && guestName && (
                    <div className="room-modal-ops-card">
                      <div className="room-modal-ops-title"><Users size={15} /> Current Stay</div>
                      <div className="room-modal-detail-row"><span className="room-modal-detail-label">Guest</span><span className="room-modal-detail-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 22, height: 22, borderRadius: '50%', background: getAvatarColor(guestName).bg, color: getAvatarColor(guestName).color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600 }}>{getInitials(guestName)}</span>{guestName}</span></div>
                    </div>
                  )}
                  {room.status === 'Reserved' && <div className="room-modal-ops-card"><div className="room-modal-ops-title"><Calendar size={15} /> Reservation</div><div className="room-modal-detail-row"><span className="room-modal-detail-label">Status</span><span className="room-modal-detail-value" style={{ color: '#4F46E5' }}>Reserved — awaiting arrival</span></div></div>}
                  {room.status === 'Available' && <div className="room-modal-ops-card"><div className="room-modal-ops-title"><CheckCircle size={15} /> Ready</div><div className="room-modal-detail-row"><span className="room-modal-detail-label">Status</span><span className="room-modal-detail-value" style={{ color: '#059669' }}>Available for assignment</span></div></div>}
                  {room.status === 'Maintenance' && mntIssue && <div className="room-modal-ops-card"><div className="room-modal-ops-title"><Wrench size={15} /> Maintenance</div><div className="room-modal-detail-row"><span className="room-modal-detail-label">Issue</span><span className="room-modal-detail-value" style={{ color: '#D97706' }}>{mntIssue}</span></div></div>}
                </>
              )}
              {activeTab === 'Housekeeping' && (
                <><div className="room-modal-section-title">Housekeeping Status</div><div className="room-modal-info-grid"><div className="room-modal-info-card"><div className="room-modal-info-label">Current Status</div><div className="room-modal-info-value">{hkStatus || 'Unknown'}</div></div><div className="room-modal-info-card"><div className="room-modal-info-label">Room</div><div className="room-modal-info-value">{room.id}</div></div></div></>
              )}
              {activeTab === 'Maintenance' && (
                <><div className="room-modal-section-title">Maintenance</div>{mntIssue ? <div className="room-modal-ops-card"><div className="room-modal-detail-row"><span className="room-modal-detail-label">Issue</span><span className="room-modal-detail-value" style={{ color: '#D97706' }}>{mntIssue}</span></div></div> : <div style={{ textAlign: 'center', padding: 32, color: '#A0A4B8', fontSize: 13 }}>No maintenance issues.</div>}</>
              )}
            </div>
            {/* View Footer */}
            <div className="room-modal-footer">
              <button className="room-modal-footer-btn" onClick={onClose}>Close</button>
              {room.status === 'Available' && <button className="room-modal-footer-btn room-modal-footer-btn-primary"><UserCheck size={14} /> Assign Guest</button>}
              {room.status === 'Occupied' && <button className="room-modal-footer-btn room-modal-footer-btn-primary"><LogOut size={14} /> Check Out</button>}
              {room.status === 'Reserved' && <button className="room-modal-footer-btn room-modal-footer-btn-primary"><UserCheck size={14} /> Check In</button>}
              {room.status === 'Maintenance' && <button className="room-modal-footer-btn room-modal-footer-btn-primary"><CheckCircle size={14} /> Mark Ready</button>}
            </div>
          </>
        ) : (

          /* ═══ EDIT MODE ═══ */
          <>
            <div className="room-modal-body">
              <div className="room-edit-grid">
                {/* Left Column */}
                <div className="room-edit-col">
                  <div className="room-edit-section-label">Basic Information</div>
                  <div className="room-edit-card">
                    <div className="room-edit-field">
                      <label className="room-edit-label">Room Number</label>
                      <input className="room-edit-input" value={room.id} disabled style={{ opacity: 0.5 }} />
                      <span className="room-edit-hint">Room number cannot be changed</span>
                    </div>
                    <div className="room-edit-row2">
                      <div className="room-edit-field">
                        <label className="room-edit-label">Floor</label>
                        <select className="room-edit-select" value={editForm.floor} onChange={e => setEditForm(f => ({ ...f, floor: e.target.value }))}>
                          {[1, 2, 3, 4, 5].map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div className="room-edit-field">
                        <label className="room-edit-label">Room Type</label>
                        <select className="room-edit-select" value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}>
                          {['Standard', 'Deluxe', 'Suite'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="room-edit-row2">
                      <div className="room-edit-field">
                        <label className="room-edit-label">Capacity (guests)</label>
                        <input className="room-edit-input" type="number" min="1" value={editForm.capacity} onChange={e => setEditForm(f => ({ ...f, capacity: e.target.value }))} />
                      </div>
                      <div className="room-edit-field">
                        <label className="room-edit-label">Rate / Night ($)</label>
                        <input className="room-edit-input" type="number" min="1" value={editForm.rate} onChange={e => setEditForm(f => ({ ...f, rate: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div className="room-edit-section-label">Amenities</div>
                  <div className="room-edit-card">
                    <div className="room-edit-chips">
                      {ALL_AMENITIES.map(a => (
                        <button key={a} type="button" className={`room-edit-chip ${editForm.amenities.includes(a) ? 'selected' : ''}`} onClick={() => toggleAmenity(a)}>{a}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="room-edit-col">
                  <div className="room-edit-section-label">Operational Setup</div>
                  <div className="room-edit-card">
                    <div className="room-edit-field">
                      <label className="room-edit-label">Status</label>
                      <div className="room-edit-status-pills">
                        {['Available', 'Maintenance'].map(s => (
                          <button key={s} type="button" className={`room-edit-status-pill ${editForm.status === s ? 'active' : ''}`} onClick={() => setEditForm(f => ({ ...f, status: s }))}>{s}</button>
                        ))}
                        {['Occupied', 'Reserved'].map(s => (
                          <button key={s} type="button" className="room-edit-status-pill disabled" disabled title={`Cannot manually set to ${s}`}>{s}</button>
                        ))}
                      </div>
                      <span className="room-edit-hint">Occupied and Reserved are set by reservations</span>
                    </div>
                  </div>

                  <div className="room-edit-section-label">Room Details</div>
                  <div className="room-edit-card">
                    <div className="room-edit-field">
                      <label className="room-edit-label">Bed Configuration</label>
                      <select className="room-edit-select" value={editForm.bedConfig} onChange={e => setEditForm(f => ({ ...f, bedConfig: e.target.value }))}>
                        <option value="">Select</option>
                        <option value="1 King">1 King Bed</option>
                        <option value="2 Twin">2 Twin Beds</option>
                        <option value="1 Queen">1 Queen Bed</option>
                        <option value="2 Double">2 Double Beds</option>
                      </select>
                    </div>
                    <div className="room-edit-field">
                      <label className="room-edit-label">View Type</label>
                      <select className="room-edit-select" value={editForm.view} onChange={e => setEditForm(f => ({ ...f, view: e.target.value }))}>
                        <option value="">Select</option>
                        <option value="City">City View</option>
                        <option value="Ocean">Ocean View</option>
                        <option value="Garden">Garden View</option>
                        <option value="Pool">Pool View</option>
                      </select>
                    </div>
                  </div>

                  <div className="room-edit-section-label">Notes</div>
                  <div className="room-edit-card">
                    <div className="room-edit-field">
                      <label className="room-edit-label">Internal Notes</label>
                      <textarea className="room-edit-textarea" rows={3} placeholder="Operational notes for this room..." value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Footer */}
            <div className="room-modal-footer">
              <button className="room-modal-footer-btn" onClick={() => setEditing(false)}>Cancel</button>
              <button className="room-modal-footer-btn room-modal-footer-btn-primary" onClick={handleSave}><Save size={14} /> Save Changes</button>
            </div>
          </>
        )}
      </div>
      {toast && <div className="room-modal-toast">{toast}</div>}
    </div>,
    document.body
  );
};

export default RoomModal;