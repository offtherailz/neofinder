import axios from "axios";
import { hour2degree, parseEphemeridesHtml } from "../utils";

/**
 *
 * @param {json} json the NEOCP JSON data
 * @description Converts the NEOCP JSON data into a GeoJSON format.
 * Each item in the NEOCP data is transformed into a GeoJSON Feature with properties
 * such as name, Temp_Desig, score, discoveryDate, magnitude, updated,
 * observations, arc, hMagnitude, and notSeenDays.
 * The geometry is a Point with coordinates based on the Right Ascension (R.A.) and
 * Declination (Decl.) of the object, converted from hours to degrees.
 * @returns {Array} An array of GeoJSON Features.
 * Each Feature has a type of "Feature", properties containing the object's data,
 * and geometry of type "Point" with coordinates [R.A. in degrees, Decl.]
 */
const neocpToGeoJSON = (json) => {
  // transforms the NEOCP data into a GeoJSON format
  /*
  "Temp_Desig": "P22dfLf",
    "Score": 92,
    "Discovery_year": 2025,
    "Discovery_month": 8,
    "Discovery_day": 19.6,
    "R.A.": 3.7359,
    "Decl.": 14.0856,
    "V": 22.1,
    "Updated": "Added Aug. 19.65 UT",
    "NObs": 3,
    "Arc": 0.04,
    "H": 21.7,
    "Not_Seen_dys": 0.04
  },*/
  return json.map((item) => {
    return {
      type: "Feature",
      properties: {
        itemData: item,
        ...item,
        name: item.Temp_Desig,
        Temp_Desig: item.Temp_Desig,
        score: item.Score,
        discoveryDate: `${item.Discovery_year}-${String(item.Discovery_month).padStart(2, '0')}-${String(Math.floor(item.Discovery_day)).padStart(2, '0')}`,
        magnitude: item.V,
        updated: item.Updated,
        observations: item.NObs,
        arc: item.Arc,
        hMagnitude: item.H,
        notSeenDays: item.Not_Seen_dys
      },
      geometry: {
        type: "Point",
        coordinates: [hour2degree(item["R.A."]), item["Decl."]]
      }
    };
  });
};
// const NEOCP_URL='https://www.minorplanetcenter.net/Extended_Files/neocp.json';
const REAL_SERVICES = {
    NEOCP_URL: "https://www.minorplanetcenter.net/Extended_Files/neocp.json",
    OBS_URL: "https://data.minorplanetcenter.net/api/get-obs-neocp"
}

const API = REAL_SERVICES;


export const fetchAsteroids = () => {
  return fetch(API.NEOCP_URL)
    .then(response => response.json())
    .then(data => {
      return {"type": "FeatureCollection", features: neocpToGeoJSON(data)};
    })
    .catch(error => console.error('Error fetching asteroids:', error));
}

export const fetchObservations = (trksubs) => {
    const options = {
        method: 'GET',
        url: 'https://data.minorplanetcenter.net/api/get-obs-neocp',
        headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/11.4.0'},
        data: {trksubs: [trksubs], output_format: ['ADES_DF']}
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
        }).catch(function (error) {
            console.error(error);
        });
}

export const fetchEphemerides = async (params) => {
  const url = "https://cgi.minorplanetcenter.net/cgi-bin/confirmeph2.cgi";
  // Se params.obj è un array, crea più parametri obj
  let formBody = Object.entries(params)
    .filter(([key]) => key !== "obj")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  if (Array.isArray(params.obj)) {
    formBody += "&" + params.obj.map(o => `obj=${encodeURIComponent(o)}`).join("&");
  } else if (params.obj) {
    formBody += `&obj=${encodeURIComponent(params.obj)}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formBody
  });

  if (!response.ok) throw new Error("Error in ephemerides request");
  const eph = parseEphemeridesHtml(response.text());
  console.log("Ephemerides fetched:", eph);
  return  eph;
};