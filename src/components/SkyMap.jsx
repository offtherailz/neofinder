import React, { useState, useRef, useEffect, useMemo } from "react";
import celestial from "d3-celestial";
import './style/celestial.css';
import './style/sky-map.css';
const Celestial = celestial.Celestial();
window.Celestial = Celestial;

const DEFAULT_CONFIG = {
  container: "map",
  form: true,
  projection: "airy",
  background: { fill: "#fff", stroke: "#000", opacity: 1, width: 1 },
  datapath: "https://ofrohn.github.io/data/",
  stars: {
    colors: false,
    names: false,
    style: { fill: "#000", opacity:1 },
    limit: 6,
    size: 5
  },
  dsos: { show: false },
  mw: {
    style: { fill:"#996", opacity: 0.1 }
  },
};

const DEFAULT_LINE_STYLE = {
  stroke:"#f00",
  fill: "rgba(255, 204, 204, 0.4)",
  width: 1
};
const DEFAULT_TEXT_STYLE = {
  fill:"#f00",
  font: "bold 15px Helvetica, Arial, sans-serif",
  align: "center",
  baseline: "middle"
};

const DEFAULT_STYLES = {
  lineStyles: {
    default: DEFAULT_LINE_STYLE,
    asteroids: DEFAULT_LINE_STYLE,
    horizon: DEFAULT_LINE_STYLE,
    selected: {
      stroke: "#00f",
       fill: "rgba(255, 204, 204, 0.4)",
      width: 5
    }
  },
  textStyles: {
    default: DEFAULT_TEXT_STYLE,
    asteroids: DEFAULT_TEXT_STYLE,
    horizon: DEFAULT_TEXT_STYLE,
    selected: DEFAULT_TEXT_STYLE
  },

};

const updateData = (data, styles, config, Celestial) => {
      Celestial.clear();
      const { lineStyles = styles.lineStyles, textStyles = styles.textStyles } = styles;
      data.forEach(({geoJSON, category="default", lineStyle, textStyle}) => {
        Celestial.add({
          type: 'line',
          callback: function(error, json) {

            if (error) return console.warn(error);
            // Load the geoJSON file and transform to correct coordinate system, if necessary
            var asterism = Celestial.getData(geoJSON, config.transform);

            // Add to celestial objects container in d3
            Celestial.container.selectAll(category)
              .data(asterism.features)
              .enter().append("path")
              .attr("class", category);
            // Trigger redraw to display changes
            Celestial.redraw();
          },

          redraw: function() {

            // Select the added objects by class name as given previously
            Celestial.container.selectAll(`.${category}`).each(function(d) {
              // Set line styles
              Celestial.setStyle(lineStyle ?? lineStyles[category] ?? DEFAULT_LINE_STYLE);
              // Project objects on map
              Celestial.map(d);
              // draw on canvas
              Celestial.context.fill();
              Celestial.context.stroke();

              // If point is visible (this doesn't work automatically for points)
              if (d?.properties?.loc && Celestial.clip(d.properties.loc)) {
                // get point coordinates
                const pt = Celestial.mapProjection(d.properties.loc);
                // Set text styles
                Celestial.setTextStyle(textStyle ?? textStyles[category] ?? DEFAULT_TEXT_STYLE);
                // and draw text on canvas
                Celestial.context.fillText(d.properties.n, pt[0], pt[1]);
              }
            });
}});
      });
    }

/**
 * Uses https://github.com/ofrohn/d3-celestial to display a sky map.
 * @param {*} geopos [lat, lon] in decimal degrees
 * @param {*} date in ISO format, e.g. "2021-09-25T04:00:00+0000"
 * @param {*} configOverrides Overrides for config, see d3-celestial config. Can include form... other overrides later
 * @param {*} styles styles for lines and text, see DEFAULT_STYLES.
 * @param {*} data array of objects with geoJSON, category, lineStyle, textStyle.
 * - geoJSON: a GeoJSON object or URL to a GeoJSON file
 * - category: a string to categorize the data, used for styling.
 * - lineStyle: an object with CSS properties for the lines, e.g. { stroke: "#f00", width: 2 }
 * - textStyle: an object with CSS properties for the text, e.g. { fill: "#f00", font: "12px Arial" }
 * @param {*} width the width of the map container
 * @returns
 */
function SkyMap({geopos = [36.525321, -121.815916], date = "2021-09-25T04:00:00+0000", configOverrides = {}, data=[], width = 400, styles = DEFAULT_STYLES}) {
  const Celestial = window.Celestial;
  const containerRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  // const dimensions = useResizeObserver(containerRef);
  const config = useMemo(() => ({
        ...DEFAULT_CONFIG,
        container: "map",
        width,
        ...(configOverrides || {}),

    }), [configOverrides, width]);
  // manage redraw on date change or config change


  // manage data display
  useEffect(() => {
    const op = setTimeout(() => {
      updateData(data, styles, config, Celestial);
      Celestial.display(config);
      Celestial.skyview({ date, location: geopos});
    }, 400);
    return () => clearTimeout(op);
  }, [geopos, data, date, styles, config, Celestial]);

  if( !window.Celestial ) {
    return <div>Loading...</div>;
  }

  return (<div className="sky-map">
      <div id="map-section" className={showForm ? 'show-form' : ''}>
        <div
          ref={containerRef} id="map-container"
          className={`sky-map-container ${showForm ? 'showform' : ''}`}>
          <div id="map"></div>
          <div id="celestial-form" style={{display: showForm ? 'block' : 'none'}} />
        </div>
      </div>
      <div className="sky-map-controls-section">
        <button id="toggle-form" onClick={() => Celestial.clear()}>clear</button>
        <button id="toggle-form" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hide Form' : 'Show Form'}
        </button>
      </div>
      </div>
  );
}
export default SkyMap;

