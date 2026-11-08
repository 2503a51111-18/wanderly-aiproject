
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./InteractiveMap.css";

// Custom Wanderly destination marker
const destinationIcon = L.divIcon({
  className: "wanderly-marker",
  html: '<div class="wanderly-marker-dot"><span>W</span></div>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19]
});

// Read coordinates from either local data or backend data
function getCoordinates(place) {
  if (!place) return null;

  const latitude = Number(place.latitude ?? place.lat);
  const longitude = Number(place.longitude ?? place.lon);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    (latitude === 0 && longitude === 0)
  ) {
    return null;
  }

  return [latitude, longitude];
}

// Keep the map centered on the selected destination
function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom(), {
      animate: true
    });
  }, [map, position[0], position[1]]);

  return null;
}

// Map tiles and destination marker
function MapContents({ place, position }) {
  return (
    <>
      <RecenterMap position={position} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <Marker position={position} icon={destinationIcon}>
        <Popup>
          <strong>{place.name}</strong>
          <br />
          {place.state || place.country || ""}
        </Popup>
      </Marker>
    </>
  );
}

export default function InteractiveMap({ place }) {
  const [expanded, setExpanded] = useState(false);

  const position = getCoordinates(place);

  // Show a helpful message if coordinates are missing
  if (!place || !position) {
    return (
      <div className="map-unavailable">
        <h3>Map coordinates unavailable</h3>
        <p>
          This destination needs valid latitude and longitude
          coordinates. Check the destination data in App.jsx
          or the backend API.
        </p>
      </div>
    );
  }

  const locationText = [
    place.name,
    place.state,
    place.country
  ]
    .filter(Boolean)
    .join(", ");

  const googleMapsUrl =
    `https://www.google.com/maps/search/?api=1&query=${
      encodeURIComponent(locationText)
    }`;

  return (
    <div className="wanderly-map-section">
      <div className="wanderly-map-heading">
        <div>
          <span className="map-eyebrow">
            EXPLORE THE LOCATION
          </span>
          <h2>Explore {place.name} on the map</h2>
          <p>
            Zoom in, move around, and explore the surrounding area.
          </p>
        </div>

        <button
          type="button"
          className="map-expand-button"
          onClick={() => setExpanded(true)}
        >
          Expand map ↗
        </button>
      </div>

      <div className="wanderly-map-preview">
        <MapContainer
          key={`preview-${position[0]}-${position[1]}`}
          center={position}
          zoom={11}
          scrollWheelZoom={true}
          zoomControl={false}
          className="wanderly-leaflet-map"
        >
          <MapContents place={place} position={position} />
          <ZoomControl position="bottomright" />
        </MapContainer>

        <button
          type="button"
          className="map-open-overlay"
          onClick={() => setExpanded(true)}
        >
          Open large map ↗
        </button>
      </div>

      <div className="map-footer">
        <span>📍 {place.name}</span>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Find this destination on Google Maps ↗
        </a>
      </div>

      {expanded && (
        <div
          className="map-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setExpanded(false);
            }
          }}
        >
          <div
            className="map-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Interactive map of ${place.name}`}
          >
            <div className="map-modal-header">
              <div>
                <span className="map-eyebrow">
                  WANDERLY MAPS
                </span>
                <h2>{place.name}</h2>
              </div>

              <div className="map-modal-actions">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="map-modal-link"
                >
                  Google Maps ↗
                </a>

                <button
                  type="button"
                  className="map-close-button"
                  onClick={() => setExpanded(false)}
                  aria-label="Close map"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="map-modal-body">
              <MapContainer
                key={`expanded-${position[0]}-${position[1]}`}
                center={position}
                zoom={12}
                scrollWheelZoom={true}
                zoomControl={false}
                className="wanderly-leaflet-map"
              >
                <MapContents place={place} position={position} />
                <ZoomControl position="bottomright" />
              </MapContainer>
            </div>

            <div className="map-modal-footer">
              Interactive map by OpenStreetMap contributors.
              Use Google Maps for additional navigation features.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
