import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import './Drawer.css';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  width?: number;
}

const Drawer = ({ open, onClose, title, subtitle, children, width = 480 }: DrawerProps) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${open ? 'drawer-backdrop-visible' : ''}`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={`drawer-panel ${open ? 'drawer-panel-open' : ''}`}
        style={{ width }}
      >
        <div className="drawer-header">
          <div className="drawer-header-text">
            {title && <h3 className="drawer-title">{title}</h3>}
            {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="drawer-body">
          {open && children}
        </div>
      </aside>
    </>
  );
};

export default Drawer;
