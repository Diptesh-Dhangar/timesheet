import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h2>Timesheet System</h2>
          </div>
          <div className="user-info">
            <span>{user?.firstName} {user?.lastName} ({user?.role})</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="main-container">
        <nav className="sidebar">
          <ul className="nav-menu">
            <li>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/timesheets" 
                className={`nav-link ${isActive('/timesheets') ? 'active' : ''}`}
              >
                My Timesheets
              </Link>
            </li>
            <li>
              <Link 
                to="/time-off" 
                className={`nav-link ${isActive('/time-off') ? 'active' : ''}`}
              >
                Time Off Requests
              </Link>
            </li>
            {user?.role === 'manager' && (
              <>
                <li className="nav-section">
                  <span className="nav-section-title">Manager Actions</span>
                </li>
                <li>
                  <Link 
                    to="/manager/timesheets" 
                    className={`nav-link ${isActive('/manager/timesheets') ? 'active' : ''}`}
                  >
                    Review Timesheets
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/manager/time-off" 
                    className={`nav-link ${isActive('/manager/time-off') ? 'active' : ''}`}
                  >
                    Review Time Off
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
