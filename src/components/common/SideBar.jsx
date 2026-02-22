import React, { useState } from 'react';
import './SideBar.css';

const Sidebar = ({width = 700, position="left", isOpen, setIsOpen,children, title}) => {

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="app-container">
      {/* Overlay for when sidebar is open */}
      {isOpen && <div className="overlay" onClick={toggleSidebar} />}

      {/* The Sidebar */}
      {isOpen && (<div className={`sidebar ${isOpen ? 'open' : ''}`}
      style={{
        maxWidth: "100%",
        width,
        display: 'flex',
        flexDirection: 'column',
        [position]: !isOpen ? `-${width}` : 0

      }}>
        <div className="sidebar-header" style={{position: 'relative'}}>
          <button className="close-btn" onClick={toggleSidebar}>&times;</button>
          {title && <h2 style={{padding: '1rem', margin: 0, borderBottom: '1px solid #ccc'}}>{title}</h2>}
        </div>

        <div className="sidebar-content" style={{ overflowY: 'auto', flex: 1}}>
         {children}
        </div>
      </div>)}
    </div>
  );
};

export default Sidebar;
