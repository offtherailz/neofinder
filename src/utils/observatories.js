
export function parseObsCodes(html) {
  // Estrae i dati degli osservatori dal file HTML
  // Cerca le righe con: code | longitude | latitude | altitude | name
  const rows = html.match(/<pre>([\s\S]*?)<\/pre>/);
  if (!rows) return [];
  return rows[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => /^[A-Za-z0-9]{3}/.test(line))
    .map(line => {
      // Esempio riga: 500 Greenwich     0.00000   51.47778   46.0  Royal Greenwich Observatory, England
      const m = line.match(/^([A-Za-z0-9]{3})\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+(.*)$/);
      if (!m) return null;
      return {
        code: m[1],
        longitude: parseFloat(m[2]),
        latitude: parseFloat(m[3]),
        altitude: parseFloat(m[4]),
        name: m[5].trim()
      };
    })
    .filter(Boolean);
}