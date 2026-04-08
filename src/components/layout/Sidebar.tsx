import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Key, CalendarCheck, Users, Receipt, UserSquare2, BarChart3, LogIn, Sparkles, Wrench, ChevronDown } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/rooms', label: 'Rooms', icon: Key },
    { path: '/reservations', label: 'Reservations', icon: CalendarCheck },
    { path: '/check-in-out', label: 'Check-In / Out', icon: LogIn },
    { path: '/guests', label: 'Guests', icon: Users },
    { path: '/billing', label: 'Billing', icon: Receipt },
    { path: '/housekeeping', label: 'Housekeeping', icon: Sparkles },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/staff', label: 'Staff', icon: UserSquare2 },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0,
      width: 'var(--sidebar-width)', height: '100vh',
      backgroundColor: '#FBFBFD',
      borderRight: '1px solid rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 14px',
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 800,
          }}>T</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1E1E2D', lineHeight: 1 }}>Templesi Court</div>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#A0A4B8', marginTop: 2 }}>Hotel Management</div>
          </div>
        </div>
        <ChevronDown size={14} color="#A0A4B8" />
      </div>

      {/* Section label */}
      <div style={{
        fontSize: 10, fontWeight: 600, color: '#B8BCC8',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        padding: '0 12px', marginBottom: 14,
      }}>
        Navigation
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sb-nav-item ${isActive ? 'sb-active' : ''}`}
            >
              <Icon size={17} className="sb-icon" strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        paddingTop: 20,
        padding: '20px 12px 0',
      }}>
        <div style={{ fontSize: 10, fontWeight: 500, color: '#B8BCC8' }}>
          © 2026 Templesi Court Hotel
        </div>
      </div>

      <style>{`
        .sb-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #6B6F80;
          text-decoration: none;
          transition: all 0.15s ease;
          letter-spacing: -0.01em;
        }
        .sb-nav-item:hover {
          background: rgba(99, 102, 241, 0.04);
          color: #4A4D5E;
        }
        .sb-nav-item .sb-icon {
          flex-shrink: 0;
          color: #A0A4B8;
          transition: color 0.15s ease;
        }
        .sb-nav-item:hover .sb-icon {
          color: #6366F1;
        }
        .sb-active {
          background: linear-gradient(135deg, #4F46E5, #6366F1) !important;
          color: #fff !important;
          font-weight: 600;
        }
        .sb-active .sb-icon {
          color: #fff !important;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;