import { useState } from "react";

export default function UtcDatetimeInput({value, onChange}) {



  // Utility per padding
  const pad = (n) => String(n).padStart(2, "0");

  // Converte Date (UTC) → stringa compatibile con datetime-local
  const toUtcInputValue = (date) => {
    return (
      date.getUTCFullYear() +
      "-" +
      pad(date.getUTCMonth() + 1) +
      "-" +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      ":" +
      pad(date.getUTCMinutes())
    );
  };

  const fromUtcInputValue = (value) => {
    if (!value) return null;
    return new Date(value + "Z");
  };

  return (
        <input
          type="datetime-local"
          value={toUtcInputValue(value)}
          onChange={(e) => {
            const d = fromUtcInputValue(e.target.value);
            if (d) {
              onChange(d);
            }
          }}
        />

  );
}
