import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ImagePlus, Plus } from 'lucide-react';
import './AddRoomModal.css';

interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (room: { id: string; type: string; rate: number; capacity: number; floor: number; status: string }) => void;
  existingIds: string[];
}

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite'];
const ALL_AMENITIES = ['Wi-Fi','TV','Air Conditioning','En-suite Bathroom','Mini-bar','Balcony','Desk','Safe','Refrigerator','Jacuzzi','Coffee Maker','Smart TV'];
const TYPE_DEFAULTS: Record<string, { rate: number; capacity: number; amenities: string[] }> = {
  Standard: { rate: 120, capacity: 2, amenities: ['Wi-Fi','TV','En-suite Bathroom'] },
  Deluxe:   { rate: 180, capacity: 3, amenities: ['Wi-Fi','TV','En-suite Bathroom','Mini-bar','Balcony'] },
  Suite:    { rate: 280, capacity: 4, amenities: ['Wi-Fi','TV','En-suite Bathroom','Mini-bar','Balcony','Jacuzzi','Desk','Safe'] },
};

const EMPTY = { roomNumber: '', floor: '', type: 'Standard', status: 'Available', capacity: '2', rate: '120',
  amenities: ['Wi-Fi','TV','En-suite Bathroom'] as string[], bedConfig: '', view: '', notes: '',
  sellable: true, active: true, images: [] as string[] };

const AddRoomModal = ({ open, onClose, onSave, existingIds }: AddRoomModalProps) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; setForm(EMPTY); setErrors({}); }
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleTypeChange = (t: string) => {
    const d = TYPE_DEFAULTS[t] || TYPE_DEFAULTS.Standard;
    setForm(f => ({ ...f, type: t, rate: String(d.rate), capacity: String(d.capacity), amenities: [...d.amenities] }));
  };
  const toggleAmenity = (a: string) => setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) setForm(f => ({ ...f, images: [...f.images, ev.target!.result as string] })); };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = '';
  };
  const removeImage = (idx: number) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.roomNumber.trim()) e.roomNumber = 'Required';
    else if (existingIds.includes(form.roomNumber.trim())) e.roomNumber = 'Already exists';
    if (!form.floor) e.floor = 'Required';
    if (Number(form.rate) <= 0) e.rate = 'Must be > 0';
    if (Number(form.capacity) < 1) e.capacity = 'Min 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ id: form.roomNumber.trim(), type: form.type, rate: Number(form.rate), capacity: Number(form.capacity), floor: Number(form.floor), status: form.status });
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className={`add-room-backdrop ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="add-room-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="add-room-header">
          <div className="add-room-header-left">
            <div className="add-room-title">Add New Room</div>
            <div className="add-room-subtitle">Create and configure a new room for inventory, booking, and operations.</div>
          </div>
          <button className="add-room-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="add-room-body">
          {/* Image Upload */}
          <div className="add-room-upload" onClick={() => fileRef.current?.click()}>
            <input type="file" accept="image/*" multiple ref={fileRef} onChange={handleImageUpload} />
            <div className="add-room-upload-icon"><ImagePlus size={24} /></div>
            <div className="add-room-upload-title">Upload Room Photos</div>
            <div className="add-room-upload-sub">Drag and drop or click to browse · JPG, PNG up to 5MB</div>
          </div>

          {form.images.length > 0 && (
            <div className="add-room-gallery">
              {form.images.map((img, i) => (
                <div key={i} className={`add-room-thumb ${i === 0 ? 'cover' : ''}`}>
                  <img src={img} alt={`Room ${i + 1}`} />
                  <button className="add-room-thumb-remove" onClick={() => removeImage(i)}>×</button>
                  {i === 0 && <span className="add-room-thumb-cover">Cover</span>}
                </div>
              ))}
            </div>
          )}

          {/* Form Grid */}
          <div className="add-room-grid">
            {/* Left Column */}
            <div className="add-room-col">
              <div className="add-room-section-label">Basic Information</div>
              <div className="add-room-card">
                <div className="add-room-row2">
                  <div className="add-room-field">
                    <label className="add-room-label">Room Number</label>
                    <input className="add-room-input" placeholder="e.g. 306" value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))} />
                    {errors.roomNumber && <span className="add-room-error">{errors.roomNumber}</span>}
                  </div>
                  <div className="add-room-field">
                    <label className="add-room-label">Floor</label>
                    <select className="add-room-select" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}>
                      <option value="">Select floor</option>
                      {[1, 2, 3, 4, 5].map(f => <option key={f} value={f}>Floor {f}</option>)}
                    </select>
                    {errors.floor && <span className="add-room-error">{errors.floor}</span>}
                  </div>
                </div>
                <div className="add-room-row2">
                  <div className="add-room-field">
                    <label className="add-room-label">Room Type</label>
                    <select className="add-room-select" value={form.type} onChange={e => handleTypeChange(e.target.value)}>
                      {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="add-room-field">
                    <label className="add-room-label">Capacity (guests)</label>
                    <input className="add-room-input" type="number" min="1" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
                    {errors.capacity && <span className="add-room-error">{errors.capacity}</span>}
                  </div>
                </div>
              </div>

              <div className="add-room-section-label">Pricing</div>
              <div className="add-room-card">
                <div className="add-room-row3">
                  <div className="add-room-field">
                    <label className="add-room-label">Base Rate / Night</label>
                    <input className="add-room-input" type="number" min="1" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} />
                    {errors.rate && <span className="add-room-error">{errors.rate}</span>}
                  </div>
                  <div className="add-room-field">
                    <label className="add-room-label">Weekend Rate</label>
                    <input className="add-room-input" type="number" placeholder="Optional" />
                  </div>
                  <div className="add-room-field">
                    <label className="add-room-label">Peak Rate</label>
                    <input className="add-room-input" type="number" placeholder="Optional" />
                  </div>
                </div>
                <div className="add-room-toggle-row">
                  <span className="add-room-toggle-label">Sellable</span>
                  <button type="button" className={`add-room-toggle ${form.sellable ? 'on' : 'off'}`} onClick={() => setForm(f => ({ ...f, sellable: !f.sellable }))} />
                </div>
                <div className="add-room-toggle-row">
                  <span className="add-room-toggle-label">Active</span>
                  <button type="button" className={`add-room-toggle ${form.active ? 'on' : 'off'}`} onClick={() => setForm(f => ({ ...f, active: !f.active }))} />
                </div>
              </div>

              <div className="add-room-section-label">Amenities</div>
              <div className="add-room-card">
                <div className="add-room-chips">
                  {ALL_AMENITIES.map(a => (
                    <button key={a} type="button" className={`add-room-chip ${form.amenities.includes(a) ? 'selected' : ''}`} onClick={() => toggleAmenity(a)}>{a}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="add-room-col">
              <div className="add-room-section-label">Operational Setup</div>
              <div className="add-room-card">
                <div className="add-room-field">
                  <label className="add-room-label">Room Status</label>
                  <div className="add-room-status-pills">
                    {['Available', 'Maintenance'].map(s => (
                      <button key={s} type="button" className={`add-room-status-pill ${form.status === s ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, status: s }))}>{s}</button>
                    ))}
                  </div>
                  <span className="add-room-hint">New rooms can only be set to Available or Maintenance</span>
                </div>
              </div>

              <div className="add-room-section-label">Room Features</div>
              <div className="add-room-card">
                <div className="add-room-field">
                  <label className="add-room-label">Bed Configuration</label>
                  <select className="add-room-select" value={form.bedConfig} onChange={e => setForm(f => ({ ...f, bedConfig: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="1 King">1 King Bed</option>
                    <option value="2 Twin">2 Twin Beds</option>
                    <option value="1 Queen">1 Queen Bed</option>
                    <option value="2 Double">2 Double Beds</option>
                  </select>
                </div>
                <div className="add-room-field">
                  <label className="add-room-label">View Type</label>
                  <select className="add-room-select" value={form.view} onChange={e => setForm(f => ({ ...f, view: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="City">City View</option>
                    <option value="Ocean">Ocean View</option>
                    <option value="Garden">Garden View</option>
                    <option value="Pool">Pool View</option>
                  </select>
                </div>
              </div>

              <div className="add-room-section-label">Notes</div>
              <div className="add-room-card">
                <div className="add-room-field">
                  <label className="add-room-label">Internal Notes</label>
                  <textarea className="add-room-textarea" rows={3} placeholder="Operational notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="add-room-footer">
          <button className="add-room-btn" onClick={onClose}>Cancel</button>
          <button className="add-room-btn" onClick={() => { if (validate()) { handleSave(); setForm(EMPTY); setErrors({}); } }}><Plus size={14} /> Save & Add Another</button>
          <button className="add-room-btn add-room-btn-primary" onClick={handleSave}>Create Room</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddRoomModal;