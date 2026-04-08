import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, Mic, ChevronDown } from 'lucide-react';
import '../../styles/modules.css';

const Layout = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/rooms': return 'Room Management';
      case '/reservations': return 'Reservations';
      case '/check-in-out': return 'Check-In & Check-Out';
      case '/guests': return 'Guest Management';
      case '/billing': return 'Billing & Invoicing';
      case '/staff': return 'Staff Management';
      case '/housekeeping': return 'Housekeeping';
      case '/maintenance': return 'Maintenance';
      case '/analytics': return 'Analytics';
      default: return 'Templesi Court Hotel';
    }
  };

  const getPageSubtitle = () => {
    switch (location.pathname) {
      case '/': return 'Real-time snapshot of hotel performance';
      case '/rooms': return 'Visibility and control over all guest rooms';
      case '/reservations': return 'Manage the full booking lifecycle';
      case '/check-in-out': return 'Guest arrivals, departures, and front desk ops';
      case '/guests': return 'Directory of all guest interactions';
      case '/billing': return 'Track financial transactions and invoices';
      case '/staff': return 'Employee schedules and duty status';
      case '/housekeeping': return 'Room cleaning and readiness operations';
      case '/maintenance': return 'Issue tracking and room repairs';
      case '/analytics': return 'Performance insights and trends';
      default: return 'Hotel Management System';
    }
  };

  return (
    <div className="app-container blue-elite">
      <Sidebar />
      <div className="main-content">
        <header className="blue-header" style={{ 
          height: 'var(--header-height)', 
          borderBottom: '1px solid var(--border-color)', 
          backgroundColor: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(16px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 32px',
          position: 'fixed',
          top: 0,
          left: '280px',
          right: 0,
          zIndex: 100
        }}>
          {/* Breadcrumb / Title */}
          <div className="header-left" style={{ width: '260px' }}>
             <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '1px' }}>{getPageTitle()}</h1>
             <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>{getPageSubtitle()}</p>
          </div>

          {/* Centralized Search — Pill Shape */}
          <div className="header-center" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div className="search-pill" style={{ 
               width: '100%', 
               maxWidth: '520px', 
               background: '#f8fafc', 
               border: '1px solid #e2e8f0', 
               borderRadius: '10px', 
               padding: '9px 16px', 
               display: 'flex', 
               alignItems: 'center', 
               gap: '10px' 
            }}>
               <Search size={16} color="var(--text-muted)" />
               <input placeholder="Search guests, rooms, or invoices..." style={{ border: 'none', background: 'transparent', fontSize: '0.8125rem', fontWeight: 600, outline: 'none', width: '100%' }} />
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="header-right" style={{ width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <button className="icon-btn-circle" style={{ width: 38, height: 38, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  <Mic size={17} />
               </button>
               <button className="icon-btn-ghost" style={{ width: 38, height: 38, borderRadius: '10px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  <Bell size={17} />
               </button>
            </div>

            <div className="header-divider" style={{ width: 1, height: 24, background: '#e2e8f0' }} />

            <div className="user-profile-widget" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
               <div className="avatar" style={{ width: 36, height: 36, background: 'var(--primary)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'normal', fontSize: '0.8125rem', fontWeight: 900 }}>G</div>
               <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>Bismark D.</div>
                  <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>bismark.d@grandvista.hotel</div>
               </div>
               <ChevronDown size={14} color="var(--text-muted)" />
            </div>
          </div>
        </header>
        
        <main className="page-content" style={{ 
          paddingLeft: '280px', /* Offset for Fixed Sidebar */
          marginTop: 'var(--header-height)', /* Offset for Fixed Header */
          width: '100%', 
          minHeight: `calc(100vh - var(--header-height))`
        }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px 32px 32px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
