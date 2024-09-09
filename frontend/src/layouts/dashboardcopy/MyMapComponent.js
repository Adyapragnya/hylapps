import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
// import 'leaflet-measure/dist/leaflet-measure.css';
import L from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-control-geocoder';
// import 'leaflet-measure';

// Function to create a custom icon with rotation
const createCustomIcon = (heading) => {
  const iconUrl = '/ship-popup.png'; 

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="transform: rotate(${heading}deg);"><img src="${iconUrl}" style="width: 12px; height: 12px;" /></div>`,
    iconSize: [7, 7],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const MapWithMarkers = ({ vessels, selectedVessel }) => {
  const map = useMap();
  const markerRef = useRef();
  const [previousVessel, setPreviousVessel] = useState(null);

  useEffect(() => {
    if (map) {
      if (selectedVessel) {
        console.log('selectedVessel:', selectedVessel); 
        if (previousVessel && previousVessel.lat && previousVessel.lng) {
          const bounds = L.latLngBounds([
            [previousVessel.lat, previousVessel.lng],
            [selectedVessel.lat, selectedVessel.lng]
          ]);

          map.flyToBounds(bounds, {
            padding: [50, 50],
            duration: 2,
            easeLinearity: 0.5
          });

          setTimeout(() => {
            const customIcon = createCustomIcon(selectedVessel.heading);

            if (markerRef.current) {
              markerRef.current.remove();
            }

            markerRef.current = L.marker([selectedVessel.lat, selectedVessel.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div>
                Name: ${selectedVessel.name}<br />
                IMO: ${selectedVessel.imo}<br />
                ETA: ${selectedVessel.eta}<br />
                Destination: ${selectedVessel.destination}<br />

              </div></br>
              <div style="text-align: right;">
                <a href="/dashboard/${selectedVessel.name}" style="cursor: pointer;">
                  <u>++View more</u>
                </a>
              </div>
            `)
            .openPopup();

            map.flyTo([selectedVessel.lat, selectedVessel.lng], 10, {
              duration: 2,
              easeLinearity: 0.5
            });
          }, 2000);
        } else {
          const customIcon = createCustomIcon(selectedVessel.heading);

          if (markerRef.current) {
            markerRef.current.remove();
          }

          markerRef.current = L.marker([selectedVessel.lat, selectedVessel.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div>
                Name: ${selectedVessel.name}<br />
                IMO: ${selectedVessel.imo}<br />
                 ETA: ${selectedVessel.eta}<br />
                  Destination: ${selectedVessel.destination}<br />

              </div></br>
              <div style="text-align: right;">
                <a href="/dashboard/${selectedVessel.name}" style="cursor: pointer;">
                  <u>++View more</u>
                </a>
              </div>
            `)
            .openPopup();

          map.flyTo([selectedVessel.lat, selectedVessel.lng], 10, {
            duration: 2,
            easeLinearity: 0.5
          });
        }

        setPreviousVessel(selectedVessel);
      } else if (vessels.length > 0) {
        const validVessels = vessels.filter(vessel => vessel.lat && vessel.lng);
        if (validVessels.length > 0) {
          const bounds = L.latLngBounds(validVessels.map(vessel => [vessel.lat, vessel.lng]));
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }
  }, [map, selectedVessel, vessels]);

  return (
    <>
      {vessels.map((vessel, index) => (
        <Marker
          key={index}
          position={[vessel.lat, vessel.lng]}
          icon={createCustomIcon(vessel.heading)}
        >
          <Popup>
            <strong>Name:</strong> {vessel.name || 'No name'}<br />
            <strong>IMO:</strong> {vessel.imo || 'N/A'}<br />
            <strong>Heading:</strong> {vessel.heading || 'N/A'}
            <strong>ETA:</strong> {vessel.eta || 'N/A'}
            <strong>Destination:</strong> {vessel.destination || 'N/A'}
         

          </Popup>
        </Marker>
      ))}
    </>
  );
};

MapWithMarkers.propTypes = {
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      imo: PropTypes.number,
      heading: PropTypes.number,
      eta: PropTypes.number,
      destination: PropTypes.string,

    }).isRequired
  ).isRequired,
  selectedVessel: PropTypes.shape({
    name: PropTypes.string.isRequired,   // Changed from _id to name
    imo: PropTypes.number,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    heading: PropTypes.number,
    eta: PropTypes.number,
    destination: PropTypes.string,
  })
};

const MapWithFullscreen = () => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      const fullscreenControl = L.control.fullscreen({
        position: 'topright',
        title: 'View Fullscreen',
        titleCancel: 'Exit Fullscreen',
      }).addTo(map);

      const resetViewControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd() {
          const container = L.DomUtil.create('div', 'leaflet-bar');
          const button = L.DomUtil.create('a', 'leaflet-bar-part leaflet-reset-view', container);
          button.title = 'Reset View';
          button.innerHTML = '<i class="fas fa-sync-alt"></i>';
          L.DomEvent.on(button, 'click', () => {
            window.location.reload();
          });
          return container;
        }
      });

      const resetControl = new resetViewControl();
      resetControl.addTo(map);

      return () => {
        fullscreenControl.remove();
        resetControl.remove();
      };
    }
  }, [map]);

  return null;
};

const MyMapComponent = ({ vessels, zoom, center, selectedVessel }) => (
 
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', backgroundColor: 'rgba(170,211,223,255)' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapWithMarkers vessels={vessels} selectedVessel={selectedVessel} />
      <MapWithFullscreen />
    </MapContainer>


);

MyMapComponent.propTypes = {
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      imo: PropTypes.number,
      heading: PropTypes.number,
      eta: PropTypes.number,
      destination: PropTypes.string,
    }).isRequired
  ).isRequired,
  zoom: PropTypes.number.isRequired,
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedVessel: PropTypes.shape({
    name: PropTypes.string.isRequired,   // Changed from _id to name
    imo: PropTypes.number,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    heading: PropTypes.number,
    eta: PropTypes.number,
    destination: PropTypes.string,
  })
};

export default MyMapComponent;
 