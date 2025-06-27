import {
  map,
  tileLayer,
  Icon,
  icon,
  marker,
  popup,
  latLng,
  control,
} from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import CONFIG from "../config";
export default class Map {
  #zoom = 5;
  #map = null;

  static async getPlaceNameByCoordinate(latitude, longitude) {
  console.log("Latitude:", latitude, "Longitude:", longitude);

  if (!latitude || !longitude) {
    console.error("Invalid coordinates:", latitude, longitude);
    return `${latitude}, ${longitude}`;
  }

  try {
    const url = new URL(`https://api.maptiler.com/geocoding/${longitude},${latitude}.json`);
    // Ensure the API key is passed as a string
    url.searchParams.set('key', CONFIG.MAP_SERVICE_API_KEY);
    url.searchParams.set('language', 'id');
    url.searchParams.set('limit', '1');

    const response = await fetch(url);
    
    // Check if the response is OK before parsing it
    if (!response.ok) {
      throw new Error(`MapTiler API request failed with status ${response.status}`);
    }

    const json = await response.json();
    const place = json.features[0].place_name.split(', ');
    return [place.at(-2), place.at(-1)].map((name) => name).join(', ');
  } catch (error) {
    console.error('getPlaceNameByCoordinate: error:', error);
    return `${latitude}, ${longitude}`;
  }
}



  static isGeoLocationSupported() {
    return "geolocation" in navigator;
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!Map.isGeoLocationSupported()) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  static async build(selector, options = {}) {
    if ("center" in options) {
      return new Map(selector, options);
    }

    const jakartaCoordinate = [-6.2, 106.816666];

    // Geolocation API
    if ("locate" in options && options.locate) {
      try {
        const position = await Map.getCurrentPosition();
        const coordinate = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        return new Map(selector, { ...options, center: coordinate });
      } catch (error) {
        console.error("Error getting current position:", error);
        return new Map(selector, { ...options, center: jakartaCoordinate });
      }
    }

    // Fallback to Jakarta coordinate
    return new Map(selector, { ...options, center: jakartaCoordinate });
  }

  constructor(selector, options = {}) {
    const mapElement = document.querySelector(selector);
    if (!mapElement) {
      throw new Error(`Element with selector "${selector}" not found.`);
    }

    // Properly destroy the existing map instance if it exists
    if (mapElement._leaflet_id) {
      const existingMap = map._instances[mapElement._leaflet_id];
      if (existingMap) {
        existingMap.eachLayer((layer) => existingMap.removeLayer(layer));
        existingMap.off(); // Remove all event listeners
        existingMap.remove(); // Remove the map instance from the DOM
      }
      mapElement._leaflet_id = null; // Clear the Leaflet instance reference
    }

    this.#zoom = options.zoom ?? this.#zoom;

    // Tile layers
    const osm = tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });

    const osmHOT = tileLayer(
      "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
      }
    );

    const openTopoMap = tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, <a href="https://viewfinderpanoramas.org/" target="_blank">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org/" target="_blank">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank">CC-BY-SA</a>)',
      }
    );

    this.#map = map(mapElement, {
      zoom: this.#zoom,
      scrollWheelZoom: false,
      layers: [osm],
      ...options,
    });

    // Layer control
    const baseLayers = {
      OpenStreetMap: osm,
      HOT: osmHOT,
      TopoMap: openTopoMap,
    };

    control.layers(baseLayers).addTo(this.#map);
  }

  createIcon(options = {}) {
    return icon({
      ...Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      ...options,
    });
  }

  addMarker(coordinate, markerOptions = {}, popupOptions = null) {
    if (typeof markerOptions !== "object") {
      throw new Error("markerOptions must be an object.");
    }

    const newMarker = marker(coordinate, {
      icon: this.createIcon(),
      ...markerOptions,
    });

    if (popupOptions) {
      if (typeof popupOptions !== "object") {
        throw new Error("popupOptions must be an object.");
      }

      if (!("content" in popupOptions)) {
        throw new Error("popupOptions must have `content` property.");
      }

      const newPopup = popup(popupOptions).setContent(popupOptions.content);
      newMarker.bindPopup(newPopup);
    }

    newMarker.addTo(this.#map);
    return newMarker;
  }

  changeCamera(coordinate, zoomLevel = null) {
    if (!zoomLevel) {
      this.#map.setView(latLng(coordinate), this.#zoom);
      return;
    }

    this.#map.setView(latLng(coordinate), zoomLevel);
  }

  getCenter() {
    const { lat, lng } = this.#map.getCenter();
    return { lat, lon: lng };
  }

  addMapEventListener(eventName, callback) {
    this.#map.addEventListener(eventName, callback);
  }
}
