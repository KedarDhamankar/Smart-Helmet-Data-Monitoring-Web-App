import React, { useEffect, useRef } from 'react';

const LiveMap = ({ latitude, longitude }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return;
        }

        const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}`;
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                center: { lat: latitude, lng: longitude },
                zoom: 18,
                mapTypeId: 'satellite',
            });

            markerRef.current = new window.google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                map: mapInstanceRef.current,
                title: 'Current Location',
            });
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (markerRef.current && typeof latitude === 'number' && typeof longitude === 'number') {
            markerRef.current.setPosition({ lat: latitude, lng: longitude });
            mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
        }
    }, [latitude, longitude]);

    return (
        <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
    );
};

export default LiveMap;
