"use client";

import { useEffect, useRef, useState } from "react";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process?.env?.NEXT_PUBLIC_MAPBOX || "";
export const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(-102.83569);
  const [lat, setLat] = useState(22.954331);

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current || document.createElement("div"),
      style: process.env.NEXT_PUBLIC_SECTION_MAP_URL,
      center: [lng, lat],
      zoom: 3,
      pitch: 0,
    });

    map?.current?.on("click", function (e: any) {
      if (!map?.current) return;

      const regex: RegExp = /\d+\w+(seccion|municipio)$/gm;
      const features: any[] = map.current.queryRenderedFeatures(e.point);
      const trueLayer = features.filter((feature) => {
        const regexValidation: boolean = regex.test(feature?.layer?.id);
        // * features?.[0]?.properties?.FIRST. This element must exist if the place  you click has candidates. Avoid you'r not clicking a water layer, woods etc.

        return regexValidation === true;
      });

      if (
        trueLayer.length &&
        trueLayer?.[0]?.properties?.FIRST &&
        trueLayer?.[0]?.properties?.FIRST_VOTES
      ) {
        const coordinates = trueLayer[0]?.geometry?.coordinates;

        if (map.current.getLayer("selected-area-border")) {
          map.current.removeLayer("selected-area-border");
        }
        if (map.current.getSource("selected-area")) {
          map.current.removeSource("selected-area");
        }

        map.current.addSource("selected-area", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [coordinates[0]],
            },
            properties: {},
          },
        });

        map.current.addLayer({
          id: "selected-area-border",
          type: "line",
          source: "selected-area",
          layout: {},
          paint: {
            "line-color": "black",
            "line-width": 3,
          },
        });
      }
    });
  }, [lat, lng]);

  return (
    <>
      <div
        ref={mapContainer}
        style={{
          height: "100%",
          width: "100%",
          position: "absolute",
          top: "0",
          bottom: "0",
        }}
      />
    </>
  );
};
