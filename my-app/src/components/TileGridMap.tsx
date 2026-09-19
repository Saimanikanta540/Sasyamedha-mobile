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

/**
 * A real map made of plain <Image> tiles from tile.openstreetmap.org — no
 * WebView, no injected JS, no third-party "free static map" service.
 *
 * This replaced an earlier Leaflet-in-a-WebView approach: that needed the
 * WebView to load ~150KB of bundled JS/CSS and then fetch tiles from inside
 * a page with no real origin, both unverifiable without an actual device to
 * test on. It also replaced a considered fallback to a hosted static-map
 * image service (staticmap.openstreetmap.de) — checked before using it and
 * found the domain no longer resolves (NXDOMAIN), i.e. it's dead. The one
 * thing actually confirmed reliable, repeatedly, this session is
 * tile.openstreetmap.org's raw {z}/{x}/{y}.png tiles — a plain image GET,
 * the most reliably-loading kind of remote resource on every platform. This
 * component only depends on that.
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
          source={{ uri: `https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png` }}
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
        <Text style={{ fontSize: 8 }}>© OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}
