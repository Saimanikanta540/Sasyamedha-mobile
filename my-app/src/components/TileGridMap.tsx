import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface TileGridMapMarker {
  id: string;
  lat: number;
  lng: number;
  selected?: boolean;
}

interface TileGridMapProps {
  center: { lat: number; lng: number };
  markers: TileGridMapMarker[];
  onMarkerPress?: (id: string) => void;
  width: number;
  height: number;
  zoom?: number;
}

const TILE_SIZE = 256;

// tile.openstreetmap.org is explicitly dev/testing-only in OSM's own tile
// usage policy (operations.osmfoundation.org/policies/tiles) — not meant for
// embedding in a real app at all, regardless of request volume. Confirmed
// directly: the device screenshot showed OSM's own "403 Blocked" tile image
// (the policy-violation response they serve back in place of a real tile),
// even though a single ad-hoc curl request succeeded — because the actual
// app fires 9-16 simultaneous tile requests per screen (a full grid), which
// is exactly the bulk/automated pattern their policy targets; a one-off
// curl test never reproduced that.
//
// CARTO's basemap tiles are a free, no-signup CDN explicitly intended for
// this — embedding in real apps/sites, not just local dev — built on OSM
// data (hence attributing both below, as their terms require).
const TILE_URL_TEMPLATE = 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

/**
 * A real map made of plain <Image> tiles from CARTO's free basemap CDN — no
 * WebView, no injected JS, no API key.
 *
 * Two earlier approaches didn't survive contact with a real device: a
 * Leaflet-in-a-WebView map (needed ~150KB of bundled JS/CSS and fetches from
 * a page with no real origin, both unverifiable without a device), and
 * raw tile.openstreetmap.org tiles (worked in isolated curl tests, but that
 * server is explicitly dev/testing-only per OSM's own tile usage policy —
 * confirmed live via a device screenshot showing OSM's actual "403 Blocked"
 * tile image, triggered by this component's normal 9-16-simultaneous-tile
 * grid, a pattern a single ad-hoc curl request never reproduced). CARTO's
 * basemap tiles are free and explicitly meant for embedding in real apps;
 * stress-tested with 56 simultaneous requests (two bursts back to back) and
 * got 200 OK on all of them before trusting it here.
 *
 * Standard slippy-map (Web Mercator) tile math: fractional tile coordinates
 * give both which tile a point falls in (integer part) and where within
 * that tile (fractional part) — used directly to place tiles and markers
 * at exact pixel offsets from the container center.
 */
function lonToTileX(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * 2 ** zoom;
}

function latToTileY(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom;
}

export function TileGridMap({ center, markers, onMarkerPress, width, height, zoom = 12 }: TileGridMapProps) {
  const centerTileX = lonToTileX(center.lng, zoom);
  const centerTileY = latToTileY(center.lat, zoom);

  const tiles = useMemo(() => {
    const tilesX = Math.ceil(width / TILE_SIZE) + 2;
    const tilesY = Math.ceil(height / TILE_SIZE) + 2;
    const baseX = Math.floor(centerTileX) - Math.ceil(tilesX / 2);
    const baseY = Math.floor(centerTileY) - Math.ceil(tilesY / 2);
    const maxTile = 2 ** zoom;

    const list: { key: string; x: number; y: number; screenX: number; screenY: number }[] = [];
    for (let dx = 0; dx <= tilesX; dx++) {
      for (let dy = 0; dy <= tilesY; dy++) {
        const tx = baseX + dx;
        const ty = baseY + dy;
        if (tx < 0 || ty < 0 || tx >= maxTile || ty >= maxTile) continue;
        list.push({
          key: `${tx}-${ty}`,
          x: tx,
          y: ty,
          screenX: width / 2 + (tx - centerTileX) * TILE_SIZE,
          screenY: height / 2 + (ty - centerTileY) * TILE_SIZE,
        });
      }
    }
    return list;
  }, [centerTileX, centerTileY, width, height, zoom]);

  return (
    <View style={{ width, height, overflow: 'hidden', backgroundColor: '#DDE3DA' }}>
      {tiles.map((tile) => (
        <Image
          key={tile.key}
          source={{
            uri: TILE_URL_TEMPLATE.replace('{z}', String(zoom))
              .replace('{x}', String(tile.x))
              .replace('{y}', String(tile.y)),
          }}
          cachePolicy="memory-disk"
          style={{ position: 'absolute', left: tile.screenX, top: tile.screenY, width: TILE_SIZE, height: TILE_SIZE }}
        />
      ))}
      {markers.map((marker) => {
        const screenX = width / 2 + (lonToTileX(marker.lng, zoom) - centerTileX) * TILE_SIZE;
        const screenY = height / 2 + (latToTileY(marker.lat, zoom) - centerTileY) * TILE_SIZE;
        return (
          <TouchableOpacity
            key={marker.id}
            onPress={() => onMarkerPress?.(marker.id)}
            style={{ position: 'absolute', left: screenX - 10, top: screenY - 10, width: 20, height: 20 }}
            accessibilityRole="button"
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: marker.selected ? '#F58220' : '#0B3B24',
                borderWidth: 2,
                borderColor: 'white',
              }}
            />
          </TouchableOpacity>
        );
      })}
      <View style={{ position: 'absolute', bottom: 2, right: 4, backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 8 }}>© OpenStreetMap contributors © CARTO</Text>
      </View>
    </View>
  );
}
