import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, 
  Search, 
  Bell, 
  ChevronDown,
  User,
  ExternalLink
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (user?.role === 'student') {
      navigate('/student/assignments');
    } else {
      navigate('/faculty/submissions');
    }
  };

  const roleText = (user?.role || 'student').toUpperCase();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'J';
  const regNo = user?.registerNumber || user?.register_number || 'REG2026CS101';

  return (
    <header className="top-navbar">
      {/* 1. Left Section: Clean Search Bar with ⌘ K */}
      <div className="navbar-left">
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search users, assignments, submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="navbar-kbd">⌘ K</span>
        </form>
      </div>

      {/* 2. Middle Section: Execution Engine Online Status Pill */}
      <div className="navbar-center">
        <div className="system-status-pill" title="Execution Engine is operational and listening">
          <span className="pulse-dot" />
          <span>Execution Engine Online</span>
        </div>
      </div>

      {/* 3. Right Section: Notifications & User Profile Menu */}
      <div className="navbar-actions">
        <button 
          className="navbar-icon-btn" 
          title="Notifications"
          onClick={() => alert('Compiler sandbox and evaluation engines are running normally.')}
        >
          <Bell size={17} />
          <span className="notif-badge" />
        </button>

        {/* User Profile Trigger */}
        <div className="user-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            className="user-profile-btn" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '8px'
            }}
          >
            <div className="user-avatar" style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#4338ca',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}>
              {userInitial}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                {user?.name || 'John Doe'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '1px 7px',
                  borderRadius: '9999px',
                  letterSpacing: '0.02em'
                }}>
                  {roleText}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                  {regNo}
                </span>
              </div>
            </div>

            <ChevronDown size={14} color="#64748b" style={{ marginLeft: '4px' }} />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown-menu">
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#64748b' }}>
                Signed in as <br /><strong style={{ color: '#0f172a' }}>{user?.email || 'student@evalhub.edu'}</strong>
              </div>
              <button 
                className="user-dropdown-item" 
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

