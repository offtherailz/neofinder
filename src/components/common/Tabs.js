import React, { useState } from 'react';
import '../style/tabs.css';
export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  return (
    <div className="tabs-container">
      <div className="tabs">
        {tabs.map((t, i) => (
          <button
            key={i}
            className={i === active ? 'active' : ''}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs?.[active]?.content}
      </div>
    </div>
  );
}