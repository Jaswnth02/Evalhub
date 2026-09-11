import React from 'react';

export function DashboardCard({ title, value, icon, color = '#6366f1', subtitle }) {
  return (
    <div className="stat-card">
      <div 
        className="stat-icon" 
        style={{ 
          background: `${color}15`, 
          color: color, 
          border: `1px solid ${color}30` 
        }}
      >
        {icon}
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label" title={title}>{title}</span>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}
