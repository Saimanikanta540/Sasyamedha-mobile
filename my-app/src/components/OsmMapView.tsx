import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import WebView from 'react-native-webview';

import { LEAFLET_CSS, LEAFLET_JS } from './leafletAssets';

export interface OsmMapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  selected?: boolean;
}

export interface OsmMapViewHandle {
  panTo: (lat: number, lng: number) => void;
}

interface OsmMapViewProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers: OsmMapMarker[];
  onMarkerPress?: (id: string) => void;
  style?: ViewStyle;
}

/**
 * OpenStreetMap via Leaflet inside a WebView — deliberately not react-native-maps.
 * react-native-maps' Android provider is Google Maps SDK natively, which needs an
 * API key baked into a custom native build; it can never work in plain Expo Go.
 *
 * Leaflet's JS/CSS are bundled inline (leafletAssets.ts) rather than loaded from a
 * CDN via <script src>/<link href> at runtime — that's unreliable inside an Android
 * WebView rendering an inline `html` source (no real origin, so cross-origin
 * sub-resource loads can silently fail depending on the device/WebView version).
 * Only the OSM tile images still need the network, and plain https image GETs are
 * the one kind of remote resource WebViews load reliably regardless of origin.
 */
function buildHtml(center: { lat: number; lng: number }, zoom: number, markers: OsmMapMarker[]): string {
  const markersJson = JSON.stringify(markers);
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>${LEAFLET_CSS}
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>${LEAFLET_JS}</script>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([${center.lat}, ${center.lng}], ${zoom});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var markerLayer = L.layerGroup().addTo(map);
    var markersById = {};

    function iconFor(selected) {
      return L.divIcon({
        className: '',
        html: '<div style="width:16px;height:16px;border-radius:50%;background:' +
          (selected ? '#F58220' : '#0B3B24') +
          ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
    }

    function setMarkers(list) {
      markerLayer.clearLayers();
      markersById = {};
      list.forEach(function (m) {
        var marker = L.marker([m.lat, m.lng], { icon: iconFor(m.selected) }).addTo(markerLayer);
        marker.bindTooltip(m.title);
        marker.on('click', function () {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(m.id);
          }
        });
        markersById[m.id] = marker;
      });
    }

    function panTo(lat, lng, zoomLevel) {
      map.setView([lat, lng], zoomLevel || map.getZoom(), { animate: true });
    }

    setMarkers(${markersJson});
  </script>
</body>
</html>`;
}

export const OsmMapView = forwardRef<OsmMapViewHandle, OsmMapViewProps>(
  ({ center, zoom = 11, markers, onMarkerPress, style }, ref) => {
    const webviewRef = useRef<WebView>(null);

    // Built once on mount; later marker/selection changes go through injectJavaScript
    // below rather than re-rendering the WebView's source (which would reload the
    // whole page and refetch every tile).
    const initialHtml = useMemo(() => buildHtml(center, zoom, markers), []); // eslint-disable-line react-hooks/exhaustive-deps

    useImperativeHandle(ref, () => ({
      panTo: (lat: number, lng: number) => {
        webviewRef.current?.injectJavaScript(`panTo(${lat}, ${lng}, 14); true;`);
      },
    }));

    const markersKey = JSON.stringify(markers);
    // Re-push markers into the already-loaded page whenever they (or their selected
    // state) change, instead of reloading the WebView.
    useEffect(() => {
      webviewRef.current?.injectJavaScript(`setMarkers(${markersKey}); true;`);
    }, [markersKey]);

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webviewRef}
          source={{ html: initialHtml }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          onMessage={(event) => onMarkerPress?.(event.nativeEvent.data)}
          style={styles.webview}
        />
      </View>
    );
  },
);
OsmMapView.displayName = 'OsmMapView';

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: 'transparent' },
});
