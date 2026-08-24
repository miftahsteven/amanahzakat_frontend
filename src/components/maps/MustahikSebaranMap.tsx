import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { isValidIndonesiaCoord } from '../../lib/wilayahCoords';

export type MapViewMode = 'wilayah' | 'mustahik' | 'program';

export interface WilayahMarker {
  id?: string;
  nama: string;
  lat: number;
  lng: number;
  jiwa: number;
  nominal: number;
  program: string;
}

export interface MustahikPoint {
  id: string;
  nama: string;
  lat: number;
  lng: number;
  asnaf?: string;
  alamat?: string;
  nominal?: number;
  program?: string;
}

export interface ProgramPoint {
  id: string;
  nama: string;
  pilar: string;
  lat: number;
  lng: number;
  jiwa: number;
  nominal: number;
  wilayah: string;
}

export interface MapFocusTarget {
  key: string;
  lat: number;
  lng: number;
}

interface MustahikSebaranMapProps {
  viewMode?: MapViewMode;
  wilayah?: WilayahMarker[];
  mustahikPoints?: MustahikPoint[];
  programPoints?: ProgramPoint[];
  className?: string;
  resizeKey?: number | boolean;
  focusTarget?: MapFocusTarget | null;
}

function formatRpShort(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)} Rb`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function markerKey(w: WilayahMarker): string {
  return w.id ?? w.nama;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function spreadOverlapping<T extends { lat: number; lng: number }>(points: T[], minDelta = 0.045): T[] {
  return points.map((point, i, all) => {
    const collisions = all.filter(
      (other, j) =>
        j < i &&
        Math.abs(other.lat - point.lat) < minDelta &&
        Math.abs(other.lng - point.lng) < minDelta
    );
    if (collisions.length === 0) return point;
    const angle = (collisions.length * 2.2) % (Math.PI * 2);
    const dist = minDelta * (0.9 + collisions.length * 0.35);
    return {
      ...point,
      lat: point.lat + Math.sin(angle) * dist,
      lng: point.lng + Math.cos(angle) * dist,
    };
  });
}

function bindOpenPopup(target: L.Layer, popupLayer: L.Layer) {
  target.on('click', (e) => {
    L.DomEvent.stopPropagation(e);
    if ('openPopup' in popupLayer && typeof popupLayer.openPopup === 'function') {
      popupLayer.openPopup();
    }
  });
}

function mustahikPinIcon(isFocused: boolean) {
  return L.divIcon({
    className: 'mustahik-gps-pin',
    html: `<button type="button" class="mustahik-gps-pin__btn ${isFocused ? 'mustahik-gps-pin__btn--active' : ''}" aria-label="Marker mustahik">
      <span class="mustahik-gps-pin__dot"></span>
    </button>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function mustahikPopupHtml(m: MustahikPoint) {
  return `<div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;min-width:200px">
    <strong style="color:#0F9D6E">${escapeHtml(m.nama)}</strong><br/>
    ${m.asnaf ? `<span style="color:#64748b">${escapeHtml(m.asnaf)}</span><br/>` : ''}
    ${m.alamat ? `<span style="color:#94a3b8;font-size:11px">${escapeHtml(m.alamat)}</span><br/>` : ''}
    ${m.nominal ? `${formatRpShort(m.nominal)} disalurkan<br/>` : ''}
    <span style="color:#64748b">${escapeHtml(m.program ?? 'Belum ada penyaluran')}</span>
  </div>`;
}

function collectBounds(
  viewMode: MapViewMode,
  wilayah: WilayahMarker[],
  mustahikPoints: MustahikPoint[],
  programPoints: ProgramPoint[]
): L.LatLngExpression[] {
  const bounds: L.LatLngExpression[] = [];
  if (viewMode === 'mustahik') {
    mustahikPoints.forEach((m) => {
      if (isValidIndonesiaCoord(Number(m.lat), Number(m.lng))) bounds.push([Number(m.lat), Number(m.lng)]);
    });
  } else if (viewMode === 'program') {
    programPoints.forEach((p) => {
      if (isValidIndonesiaCoord(Number(p.lat), Number(p.lng))) bounds.push([Number(p.lat), Number(p.lng)]);
    });
  } else {
    wilayah.forEach((w) => {
      if (isValidIndonesiaCoord(Number(w.lat), Number(w.lng))) bounds.push([Number(w.lat), Number(w.lng)]);
    });
  }
  return bounds;
}

export function MustahikSebaranMap({
  viewMode = 'wilayah',
  wilayah = [],
  mustahikPoints = [],
  programPoints = [],
  className = '',
  resizeKey,
  focusTarget,
}: MustahikSebaranMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Map<string, L.Layer>>(new Map());
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-6.2, 106.8],
      zoom: 7,
      minZoom: 4,
      maxZoom: 16,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    overlayGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      overlayGroupRef.current = null;
      layersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = overlayGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    layersRef.current.clear();

    const bounds: L.LatLngExpression[] = [];
    const focusedKey = focusTarget?.key;

    if (viewMode === 'mustahik') {
      mustahikPoints.forEach((m) => {
        const lat = Number(m.lat);
        const lng = Number(m.lng);
        if (!isValidIndonesiaCoord(lat, lng)) return;

        const key = m.id;
        const isFocused = focusedKey === key;

        const hitArea = L.circleMarker([lat, lng], {
          radius: 16,
          color: 'transparent',
          weight: 0,
          fillColor: '#C8933A',
          fillOpacity: 0.001,
          interactive: true,
          bubblingMouseEvents: false,
        });

        const pin = L.marker([lat, lng], {
          icon: mustahikPinIcon(isFocused),
          interactive: true,
          keyboard: true,
          riseOnHover: true,
          zIndexOffset: isFocused ? 1000 : 200,
        });

        const popup = mustahikPopupHtml(m);
        hitArea.bindPopup(popup);
        pin.bindPopup(popup);

        const open = () => {
          pin.openPopup();
          pin.setZIndexOffset(1000);
        };

        hitArea.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          open();
        });
        pin.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          open();
        });

        group.addLayer(hitArea);
        group.addLayer(pin);
        layersRef.current.set(key, pin);
        bounds.push([lat, lng]);
      });
    } else if (viewMode === 'program') {
      const spread = spreadOverlapping(programPoints);
      spread.forEach((p) => {
        const lat = Number(p.lat);
        const lng = Number(p.lng);
        if (!isValidIndonesiaCoord(lat, lng)) return;

        const key = p.id;
        const radius = Math.min(28, 14 + p.jiwa * 2);
        const isFocused = focusedKey === key;

        const hitArea = L.circleMarker([lat, lng], {
          radius: Math.max(22, radius + 8),
          color: 'transparent',
          weight: 0,
          fillColor: '#C8933A',
          fillOpacity: 0.001,
          interactive: true,
          bubblingMouseEvents: false,
        });

        const circle = L.circleMarker([lat, lng], {
          radius: isFocused ? radius + 4 : radius,
          color: isFocused ? '#FDE68A' : '#ffffff',
          weight: isFocused ? 4 : 3,
          fillColor: '#C8933A',
          fillOpacity: isFocused ? 0.9 : 0.8,
          interactive: true,
          bubblingMouseEvents: false,
        });

        const popupHtml = `<div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;min-width:200px">
            <strong style="color:#C8933A">${escapeHtml(p.nama)}</strong><br/>
            <span style="color:#64748b">Pilar ${escapeHtml(p.pilar)}</span><br/>
            ${p.jiwa} penerima manfaat<br/>
            ${formatRpShort(p.nominal)} disalurkan<br/>
            <span style="color:#94a3b8;font-size:11px">${escapeHtml(p.wilayah)}</span>
          </div>`;

        circle.bindPopup(popupHtml);
        hitArea.bindPopup(popupHtml);
        bindOpenPopup(hitArea, circle);
        bindOpenPopup(circle, circle);

        const shortLabel = p.nama.length > 28 ? `${p.nama.slice(0, 26)}…` : p.nama;
        const icon = L.divIcon({
          className: 'mustahik-map-label mustahik-map-label--program',
          html: `<span class="${isFocused ? 'mustahik-map-label--active mustahik-map-label--program-active' : 'mustahik-map-label--program-chip'}">${escapeHtml(shortLabel)} (${p.jiwa})</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, -radius - 4],
        });

        const labelMarker = L.marker([lat, lng], { icon, interactive: false, keyboard: false });

        group.addLayer(hitArea);
        group.addLayer(circle);
        group.addLayer(labelMarker);
        layersRef.current.set(key, circle);
        bounds.push([lat, lng]);
      });
    } else {
      wilayah.forEach((w) => {
        const lat = Number(w.lat);
        const lng = Number(w.lng);
        if (!isValidIndonesiaCoord(lat, lng)) return;

        const key = markerKey(w);
        const label = w.nama.split('(')[0].trim();
        const radius = Math.min(28, 10 + w.jiwa * 3);
        const isFocused = focusedKey === key;

        const circle = L.circleMarker([lat, lng], {
          radius: isFocused ? radius + 4 : radius,
          color: isFocused ? '#A5E4CB' : '#0F9D6E',
          weight: isFocused ? 3 : 2,
          fillColor: '#0F9D6E',
          fillOpacity: isFocused ? 0.55 : 0.35,
          interactive: true,
          bubblingMouseEvents: false,
        });

        const popupHtml = `<div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;min-width:180px">
            <strong style="color:#0F9D6E">${escapeHtml(label)}</strong><br/>
            ${w.jiwa} penerima manfaat<br/>
            ${formatRpShort(w.nominal)} disalurkan<br/>
            <span style="color:#64748b">${escapeHtml(w.program)}</span>
          </div>`;
        circle.bindPopup(popupHtml);
        bindOpenPopup(circle, circle);

        const icon = L.divIcon({
          className: 'mustahik-map-label',
          html: `<span class="${isFocused ? 'mustahik-map-label--active' : ''}">${escapeHtml(label)} (${w.jiwa})</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, -radius - 4],
        });

        const labelMarker = L.marker([lat, lng], { icon, interactive: false, keyboard: false });

        group.addLayer(circle);
        group.addLayer(labelMarker);
        layersRef.current.set(key, circle);
        bounds.push([lat, lng]);
      });
    }

    if (!focusTarget) {
      if (bounds.length === 1) {
        map.setView(bounds[0], viewMode === 'mustahik' ? 12 : 9);
      } else if (bounds.length > 1) {
        map.fitBounds(L.latLngBounds(bounds), {
          padding: [48, 48],
          maxZoom: viewMode === 'mustahik' ? 12 : 9,
        });
      } else {
        map.setView([-6.2, 106.8], 7);
      }
    }
  }, [viewMode, wilayah, mustahikPoints, programPoints, focusTarget?.key]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusTarget) return;

    const { lat, lng, key } = focusTarget;
    if (!isValidIndonesiaCoord(lat, lng)) return;

    map.flyTo([lat, lng], viewMode === 'mustahik' ? 14 : 10, { duration: 1.25, easeLinearity: 0.25 });

    const timer = window.setTimeout(() => {
      const layer = layersRef.current.get(key);
      if (layer && 'openPopup' in layer && typeof layer.openPopup === 'function') {
        layer.openPopup();
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [focusTarget, viewMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const timer = window.setTimeout(() => {
      map.invalidateSize();
      if (focusTarget) return;

      const bounds = collectBounds(viewMode, wilayah, mustahikPoints, programPoints);
      if (bounds.length === 1) {
        map.setView(bounds[0], viewMode === 'mustahik' ? 12 : 9);
      } else if (bounds.length > 1) {
        map.fitBounds(L.latLngBounds(bounds), {
          padding: [48, 48],
          maxZoom: viewMode === 'mustahik' ? 12 : 10,
        });
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [resizeKey, viewMode, wilayah, mustahikPoints, programPoints, focusTarget]);

  return <div ref={containerRef} className={`mustahik-sebaran-map ${className}`} />;
}
