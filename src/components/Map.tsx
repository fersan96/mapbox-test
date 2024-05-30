"use client";

import { useEffect, useRef, useState } from "react";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/app.css";

mapboxgl.accessToken = process?.env?.NEXT_PUBLIC_MAPBOX || "";
export const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(-102.83569);
  const [lat, setLat] = useState(22.954331);

  useEffect(() => {
    const currentMap = new mapboxgl.Map({
      container: mapContainer.current || document.createElement("div"),
      style: process.env.NEXT_PUBLIC_SECTION_MAP_URL,
      center: [lng, lat],
      zoom: 3,
      pitch: 0,
    });

    currentMap.on("style.load", function (e: any) {
      // Note: encode UNIQUE_ID as feature.id in the data directly to avoid this hack
      currentMap.getSource("composite").promoteId = {
        "2018_seccion2GeoJSON": "UNIQUE_ID",
        "2018_municipal": "UNIQUE_ID",
      };
      // ! The 2024 UNIQUE_ID are : 
      // ! 2024_municipal
      // ! 2024_seccion_1
      
      // add a highlight layer for both source layers, initially invisible
      for (const sourceLayer of ["2018_seccion2GeoJSON", "2018_municipal"]) {
        currentMap.addLayer({
          id: `${sourceLayer}_highlight`,
          type: "line",
          source: "composite",
          "source-layer": sourceLayer,
          paint: {
            "line-color": "black",
            "line-width": 3,
            "line-opacity": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              1,
              0,
            ],
          },
        });
      }
    });

    let selectedFeature = null;

    currentMap.on("click", function (e: any) {
      if (selectedFeature) {
        // reset previously selected feature
        currentMap.setFeatureState(selectedFeature, { selected: false });
      }

      // query a feature from one of the 4 layers
      selectedFeature = currentMap.queryRenderedFeatures(e.point, {
        layers: [
          "2018_presidencial_mexico_data_seccion",
          "2018_presidencial_mexico_data_municipio",
          "2024_presidencial_mexico_data_seccion",
          "2024_presidencial_mexico_data_municipio",
        ],
      })[0];

      // if found, set it as selected (triggering the opacity expression in one of the highlight layers)
      if (
        selectedFeature &&
        selectedFeature.properties.FIRST &&
        selectedFeature.properties.FIRST_VOTES
      ) {
        currentMap.setFeatureState(selectedFeature, { selected: true });
      }
    });

    map.current = currentMap;
  }, [lat, lng]);

  const handleChangeYear = (event: any) => {
    const targetElement = event.target as HTMLButtonElement;
    const year = targetElement.innerText;
    const wrapperElement = targetElement.parentElement;
    if (!wrapperElement) return;

    if (!map.current) return;
    // const layers = map.current.getStyle().layers; // get all layers

    // * Show/Hide the layers | 2018 & 2024
    if (year === "2024") {
      map.current!?.setLayoutProperty(
        `2018_presidencial_mexico_data_seccion`,
        "visibility",
        "none"
      );
      map.current!?.setLayoutProperty(
        `2018_presidencial_mexico_data_municipio`,
        "visibility",
        "none"
      );
      map.current!?.setLayoutProperty(
        `2024_presidencial_mexico_data_seccion`,
        "visibility",
        "visible"
      );
      map.current!?.setLayoutProperty(
        `2024_presidencial_mexico_data_municipio`,
        "visibility",
        "visible"
      );
    } else {
      map.current!?.setLayoutProperty(
        `2024_presidencial_mexico_data_seccion`,
        "visibility",
        "none"
      );
      map.current!?.setLayoutProperty(
        `2024_presidencial_mexico_data_municipio`,
        "visibility",
        "none"
      );
      map.current!?.setLayoutProperty(
        `2018_presidencial_mexico_data_seccion`,
        "visibility",
        "visible"
      );
      map.current!?.setLayoutProperty(
        `2018_presidencial_mexico_data_municipio`,
        "visibility",
        "visible"
      );
    }
  };

  return (
    <section className="containerMap">
      <div>
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
      </div>
      <div className="wrapperButtons">
        <button
          className="button"
          onClick={(event) => {
            handleChangeYear(event);
          }}
        >
          2024
        </button>
        <button
          className="button"
          onClick={(event) => {
            handleChangeYear(event);
          }}
        >
          2018
        </button>
      </div>
    </section>
  );
};
