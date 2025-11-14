import React, { useEffect, useRef, useState } from "react";

const TrafficRouteMap = () => {
  const mapRef = useRef(null);
  const [source] = useState([12.986253, 77.740433]); // Example: Whitefield, Bangalore
  const [destination] = useState([13.016341, 77.770445]); // Example: KR Puram, Bangalore

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: source[0], lng: source[1] },
        zoom: 13,
      });

      // Add live traffic layer
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(map);

      // Draw route with live traffic
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
      });
      directionsRenderer.setMap(map);

      const request = {
        origin: { lat: source[0], lng: source[1] },
        destination: { lat: destination[0], lng: destination[1] },
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(), // Current time for live traffic
          trafficModel: "bestguess",
        },
      };

      directionsService.route(request, (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
        } else {
          console.error("Directions request failed:", status);
        }
      });
    };

    loadGoogleMaps();
  }, [source, destination]);

  return (
    <div>
      <h2 style={{ textAlign: "center" }}> Live Traffic Route</h2>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "500px", borderRadius: "12px" }}
      ></div>
    </div>
  );
};

export default TrafficRouteMap;
