import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  // Simple mapping to get page title based on route
  const getPageTitle = (path: string) => {
    switch(path) {
      case '/': return 'Dashboard';
      case '/rooms': return 'Room Management';
      case '/reservations': return 'Reservations';
      case '/guests': return 'Guest Directory';
      case '/billing': return 'Billing & Invoicing';
      case '/staff': return 'Staff Roster';
      default: return 'Templesi Court Hotel';
    }
  };

  return (
    <header className="header">
      <div className="header-title">
        {getPageTitle(location.pathname)}
      </div>
      <div className="header-actions">
        <button style={{ color: 'var(--text-secondary)' }}>
          <Search size={20} />
        </button>
        <button style={{ color: 'var(--text-secondary)', position: 'relative' }}>
          <Bell size={20} />
          <span style={{ 
            position: 'absolute', top: 0, right: 0, width: 8, height: 8, 
            backgroundColor: 'var(--status-error)', borderRadius: '50%' 
          }}></span>
        </button>
        <div className="staff-profile">
          <div className="staff-info">
            <span className="staff-name">Sarah Jenkins</span>
            <span className="staff-role">Front Desk, Morning</span>
          </div>
          <div className="staff-avatar">SJ</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
