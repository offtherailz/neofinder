


/**
 * MPCForm component
 *
 * Form to create a `params` object with the parameters required by the MPC WebCS service.
 *
 * @typedef {Object} MPCParams
 * @property {('a'|'j')} W - Object selection mode: 'a' = all objects, 'j' = selected objects only.
 * @property {number} mb - Lower limit for V magnitude.
 * @property {number} mf - Upper limit for V magnitude.
 * @property {number} dl - Minimum declination (degrees).
 * @property {number} du - Maximum declination (degrees).
 * @property {number} nl - Minimum NEO desirability score (%).
 * @property {number} nu - Maximum NEO desirability score (%).
 * @property {string} sort - Sorting parameter (MPC documentation not explicit).
 * @property {0|1|2} Parallax - Parallax type: 0 = geocentric, 1 = observatory code, 2 = custom coordinates.
 * @property {number} obscode - Observatory code (if Parallax = 1).
 * @property {string} long - Longitude in degrees (if Parallax = 2).
 * @property {string} lat - Latitude in degrees (if Parallax = 2).
 * @property {number} alt - Altitude in meters (if Parallax = 2).
 * @property {0|1|2|3} int - Ephemeris interval: 0 = 1h, 1 = 30min, 2 = 10min, 3 = 1min.
 * @property {number} start - Start offset in hours from now.
 * @property {('h'|'a'|'d')} raty - RA/Dec output format: 'h' = truncated sexagesimal, 'a' = full sexagesimal, 'd' = decimal.
 * @property {('s'|'m'|'h'|'d')} mot - Motion units: 's' = "/sec, 'm' = "/min, 'h' = "/hr, 'd' = °/day.
 * @property {('p'|'r'|'s')} dmot - Motion display mode: 'p' = total + direction, 'r' = RA/Dec separate, 's' = sky motions separate.
 * @property {('f'|'b')} out - Output type: 'f' = full, 'b' = brief.
 * @property {('x'|'s'|'c'|'n'|'a')} sun - Sun horizon suppression: 'x' = never, 's' = set/rise, 'c' = civil twilight, 'n' = nautical twilight, 'a' = astronomical twilight.
 * @property {number} oalt - Minimum altitude (degrees) for output suppression.
 */

export default function MPCForm({ params, setParams }) {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: isNaN(value) ? value : value === "" ? "" : Number(value)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">MPC Params Form</h1>
      <form className="grid grid-cols-2 gap-4">
        <label className="flex flex-col" title="Object selection: all or selected only">
          W (object selection)
          <select name="W" value={params.W} onChange={handleChange}>
            <option value="a">All objects</option>
            <option value="j">Selected objects only</option>
          </select>
        </label>
        <label className="flex flex-col" title="Lower V magnitude limit">
          mb (V mag min)
          <input type="number" name="mb" value={params.mb} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="Upper V magnitude limit">
          mf (V mag max)
          <input type="number" name="mf" value={params.mf} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="Minimum declination in degrees">
          dl (Dec min)
          <input type="number" name="dl" value={params.dl} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="Maximum declination in degrees">
          du (Dec max)
          <input type="number" name="du" value={params.du} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="Minimum NEO score (%)">
          nl (NEO score min)
          <input type="number" name="nl" value={params.nl} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="Maximum NEO score (%)">
          nu (NEO score max)
          <input type="number" name="nu" value={params.nu} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="Sorting parameter (MPC unspecified)">
          sort
          <input type="text" name="sort" value={params.sort} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="Parallax type: geocentric, observatory code or custom">
          Parallax
          <select name="Parallax" value={params.Parallax} onChange={handleChange}>
            <option value={0}>Geocentric</option>
            <option value={1}>Observatory code</option>
            <option value={2}>Custom coordinates</option>
          </select>
        </label>
        <label className="flex flex-col" title="Observatory code (if Parallax = 1)">
          obscode
          <input type="number" name="obscode" value={params.obscode} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="Longitude in degrees (if Parallax = 2)">
          long
          <input type="text" name="long" value={params.long} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="Latitude in degrees (if Parallax = 2)">
          lat
          <input type="text" name="lat" value={params.lat} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="Altitude in meters (if Parallax = 2)">
          alt
          <input type="number" name="alt" value={params.alt} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="Ephemeris interval">
          int (interval)
          <select name="int" value={params.int} onChange={handleChange}>
            <option value={0}>1h</option>
            <option value={1}>30 min</option>
            <option value={2}>10 min</option>
            <option value={3}>1 min</option>
          </select>
        </label>
        <label className="flex flex-col" title="Start offset in hours from now">
          start (hours from now)
          <input type="number" name="start" value={params.start} onChange={handleChange} />
        </label>
        <label className="flex flex-col" title="RA/Dec output format">
          raty (RA/Dec format)
          <select name="raty" value={params.raty} onChange={handleChange}>
            <option value="h">Truncated sexagesimal</option>
            <option value="a">Full sexagesimal</option>
            <option value="d">Decimal</option>
          </select>
        </label>
        <label className="flex flex-col" title="Motion units">
          mot (motion)
          <select name="mot" value={params.mot} onChange={handleChange}>
            <option value="s">"/sec</option>
            <option value="m">"/min</option>
            <option value="h">"/hr</option>
            <option value="d">°/day</option>
          </select>
        </label>
        <label className="flex flex-col" title="Motion display mode">
          dmot (motion mode)
          <select name="dmot" value={params.dmot} onChange={handleChange}>
            <option value="p">Total + direction</option>
            <option value="r">Separate RA/Dec</option>
            <option value="s">Separate sky motion</option>
          </select>
        </label>
        <label className="flex flex-col" title="Output type">
          out (output)
          <select name="out" value={params.out} onChange={handleChange}>
            <option value="f">Full</option>
            <option value="b">Brief</option>
          </select>
        </label>
        <label className="flex flex-col" title="Sun horizon suppression mode">
          sun
          <select name="sun" value={params.sun} onChange={handleChange}>
            <option value="x">Never</option>
            <option value="s">Set/Rise</option>
            <option value="c">Civil twilight</option>
            <option value="n">Nautical twilight</option>
            <option value="a">Astronomical twilight</option>
          </select>
        </label>
        <label className="flex flex-col" title="Minimum altitude (degrees) for output">
          oalt (min altitude)
          <input type="number" name="oalt" value={params.oalt} onChange={handleChange} />
        </label>
      </form>

      <pre className="mt-6 p-2 bg-gray-100 rounded">
        {JSON.stringify(params, null, 2)}
      </pre>
    </div>
  );
}
