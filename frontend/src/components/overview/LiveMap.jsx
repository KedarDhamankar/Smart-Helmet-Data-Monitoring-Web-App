import React, { useEffect, useRef } from 'react';
import { Deck } from '@deck.gl/core';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { ScatterplotLayer } from '@deck.gl/layers';

const LiveMap = ({ latitude, longitude }) => {
    const mapContainer = useRef(null);
    const creditsRef = useRef(null);
    const deckRef = useRef(null); // Hold deck instance for updates



    useEffect(() => {
        console.log(latitude, longitude);
        const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
        const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

        const deckgl = new Deck({
            parent: mapContainer.current,
            style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1
            },
            initialViewState: {
                latitude: latitude ?? 50.0890,
                longitude: longitude ?? 14.4196,
                zoom: 15,
                bearing: 90,
                pitch: 60,
                height: 200
            },
            controller: { minZoom: 8 }
        });

        deckRef.current = deckgl;

        const tiles3dLayer = new Tile3DLayer({
            id: 'google-3d-tiles',
            data: TILESET_URL,
            loadOptions: {
                fetch: {
                    headers: {
                        'X-GOOG-API-KEY': GOOGLE_API_KEY
                    }
                }
            },
            onTilesetLoad: (tileset3d) => {
                tileset3d.options.onTraversalComplete = (selectedTiles) => {
                    const credits = new Set();
                    selectedTiles.forEach(tile => {
                        const { copyright } = tile.content.gltf.asset;
                        copyright.split(';').forEach(c => credits.add(c));
                    });
                    if (creditsRef.current) {
                        creditsRef.current.innerHTML = [...credits].join('; ');
                    }
                    return selectedTiles;
                };
            }
        });

        deckgl.setProps({ layers: [tiles3dLayer] });

        return () => deckgl.finalize();
    }, []);

    // 🛰️ Update marker on coordinate change
    useEffect(() => {
        if (!deckRef.current || latitude === undefined || longitude === undefined) return;

        const markerLayer = new ScatterplotLayer({
            id: 'current-position-marker',
            data: [{ position: [latitude, longitude] }],
            getPosition: d => d.position,
            getRadius: 10,
            getFillColor: [255, 0, 0],
            radiusMinPixels: 10,
            radiusMaxPixels: 15,
            pickable: false
        });

        const layers = [...deckRef.current.props.layers.filter(layer => layer.id !== 'current-position-marker'), markerLayer];
        deckRef.current.setProps({ layers });
    }, [latitude, longitude]);

    return (
        <div ref={mapContainer} className="relative w-full h-full overflow-hidden">
            <div ref={creditsRef} className="absolute bottom-0 right-0 p-2 text-xs text-white z-10" />
        </div>
    );
};

export default LiveMap;
