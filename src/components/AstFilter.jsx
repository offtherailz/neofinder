import React, { useState } from 'react';
import { FaFilter } from 'react-icons/fa';


export default function AsteroidFilter({ filter, setFilter }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };

  return (
    <form>

    <fieldset>
        <button className={filter?.horizon ? "button-active" : ""} onClick={() => setFilter({
                    ...filter,
                    horizon: !filter.horizon
                  })}>
                    <FaFilter /> Filter by Horizon
                  </button>
        <label>
          Not Seen &lt;
          <input
            style={{width: 50}}
            type="number"
            step="any"
            name="notSeenMax"
            value={filter.notSeenMax}
            onChange={handleChange}
          />
          days
        </label>
      </fieldset>
    </form>
  );
}
