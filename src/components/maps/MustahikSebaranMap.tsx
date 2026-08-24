import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { isValidIndonesiaCoord } from '../../lib/wilayahCoords';

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

export interface MapFocusTarget {
  key: string;
  lat: number;
  lng: number;
}

interface MustahikSebaranMapProps {
  viewMode?: 'wilayah' | 'mustahik';
  wilayah?: WilayahMarker[];
  mustahikPoints?: MustahikPoint[];
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

export function MustahikSebaranMap({
  viewMode = 'wilayah',
  wilayah = [],
  mustahikPoints = [],
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

        // Invisible larger hit-target under the pin so clicks are reliable
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

        circle.bindPopup(
          `<div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;min-width:180px">
            <strong style="color:#0F9D6E">${escapeHtml(label)}</strong><br/>
            ${w.jiwa} penerima manfaat<br/>
            ${formatRpShort(w.nominal)} disalurkan<br/>
            <span style="color:#64748b">${escapeHtml(w.program)}</span>
          </div>`
        );

        const icon = L.divIcon({
          className: 'mustahik-map-label',
          html: `<span class="${isFocused ? 'mustahik-map-label--active' : ''}">${escapeHtml(label)} (${w.jiwa})</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, -radius - 4],
        });

        const labelMarker = L.marker([lat, lng], { icon, interactive: false });

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
  }, [viewMode, wilayah, mustahikPoints, focusTarget?.key]);

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

      const bounds: L.LatLngExpression[] = [];
      if (viewMode === 'mustahik') {
        mustahikPoints.forEach((m) => {
          const lat = Number(m.lat);
          const lng = Number(m.lng);
          if (isValidIndonesiaCoord(lat, lng)) bounds.push([lat, lng]);
        });
      } else {
        wilayah.forEach((w) => {
          const lat = Number(w.lat);
          const lng = Number(w.lng);
          if (isValidIndonesiaCoord(lat, lng)) bounds.push([lat, lng]);
        });
      }

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
  }, [resizeKey, viewMode, wilayah, mustahikPoints, focusTarget]);

  return <div ref={containerRef} className={`mustahik-sebaran-map ${className}`} />;
}
