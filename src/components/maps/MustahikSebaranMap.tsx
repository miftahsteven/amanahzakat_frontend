import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { isValidIndonesiaCoord } from '../../lib/wilayahCoords';

export interface WilayahMarker {
  nama: string;
  lat: number;
  lng: number;
  jiwa: number;
  nominal: number;
  program: string;
}

interface MustahikSebaranMapProps {
  wilayah: WilayahMarker[];
  className?: string;
  /** Trigger Leaflet resize when container size changes (e.g. modal open) */
  resizeKey?: number | boolean;
}

function formatRpShort(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)} Rb`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export function MustahikSebaranMap({ wilayah, className = '', resizeKey }: MustahikSebaranMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-6.2, 106.8],
      zoom: 7,
      minZoom: 4,
      maxZoom: 12,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    const bounds: L.LatLngExpression[] = [];

    wilayah.forEach((w) => {
      const lat = Number(w.lat);
      const lng = Number(w.lng);
      if (!isValidIndonesiaCoord(lat, lng)) return;

      const label = w.nama.split('(')[0].trim();
      const radius = Math.min(28, 10 + w.jiwa * 3);

      const circle = L.circleMarker([lat, lng], {
        radius,
        color: '#0F9D6E',
        weight: 2,
        fillColor: '#0F9D6E',
        fillOpacity: 0.35,
      }).addTo(map);

      circle.bindPopup(
        `<div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;min-width:180px">
          <strong style="color:#0F9D6E">${label}</strong><br/>
          ${w.jiwa} penerima manfaat<br/>
          ${formatRpShort(w.nominal)} disalurkan<br/>
          <span style="color:#64748b">${w.program}</span>
        </div>`
      );

      const icon = L.divIcon({
        className: 'mustahik-map-label',
        html: `<span>${label} (${w.jiwa})</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, -radius - 4],
      });

      L.marker([lat, lng], { icon, interactive: false }).addTo(map);

      bounds.push([lat, lng]);
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], 9);
    } else if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [48, 48], maxZoom: 9 });
    } else {
      map.setView([-6.2, 106.8], 7);
    }
  }, [wilayah]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const timer = window.setTimeout(() => {
      map.invalidateSize();
      const bounds: L.LatLngExpression[] = [];
      wilayah.forEach((w) => {
        const lat = Number(w.lat);
        const lng = Number(w.lng);
        if (isValidIndonesiaCoord(lat, lng)) bounds.push([lat, lng]);
      });
      if (bounds.length === 1) {
        map.setView(bounds[0], 9);
      } else if (bounds.length > 1) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [48, 48], maxZoom: 10 });
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [resizeKey, wilayah]);

  return <div ref={containerRef} className={`mustahik-sebaran-map ${className}`} />;
}
