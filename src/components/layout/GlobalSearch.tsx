import React, { useEffect, useMemo, useRef, useState } from 'react';
import { dashboardApi } from '../../lib/api';

export type SearchHit = {
  id: string;
  screen: string;
  title: string;
  subtitle: string;
};

type SearchGroups = {
  menus: SearchHit[];
  muzakki: SearchHit[];
  mustahik: SearchHit[];
  penerimaan: SearchHit[];
  penyaluran: SearchHit[];
};

const EMPTY_GROUPS: SearchGroups = {
  menus: [],
  muzakki: [],
  mustahik: [],
  penerimaan: [],
  penyaluran: [],
};

const GROUP_ORDER: Array<{ key: keyof SearchGroups; label: string }> = [
  { key: 'menus', label: 'Menu' },
  { key: 'penerimaan', label: 'Penerimaan' },
  { key: 'penyaluran', label: 'Penyaluran' },
  { key: 'muzakki', label: 'Muzakki' },
  { key: 'mustahik', label: 'Mustahik' },
];

export function GlobalSearch({
  onSelect,
}: {
  onSelect: (screen: string, id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<SearchGroups>(EMPTY_GROUPS);
  const wrapRef = useRef<HTMLDivElement>(null);

  const hits = useMemo(
    () => [...groups.menus, ...groups.penerimaan, ...groups.penyaluran, ...groups.muzakki, ...groups.mustahik],
    [groups]
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setGroups(EMPTY_GROUPS);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const data = await dashboardApi.search(q);
        setGroups({
          menus: data.menus ?? [],
          muzakki: data.muzakki ?? [],
          mustahik: data.mustahik ?? [],
          penerimaan: data.penerimaan ?? [],
          penyaluran: data.penyaluran ?? [],
        });
        setOpen(true);
      } catch {
        setGroups(EMPTY_GROUPS);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-64" ref={wrapRef}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D6E] absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        placeholder="Cari menu atau data…"
        className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#F1F4F1] border border-[#E3E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F9D6E] text-[#16211D] placeholder:text-[#9FB3AA]"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute right-0 top-full mt-1.5 w-80 max-h-80 overflow-y-auto bg-white border border-[#E3E8E4] rounded-xl shadow-lg z-40">
          {loading && <p className="px-3 py-2.5 text-[11px] text-[#7D938A]">Mencari…</p>}
          {!loading && hits.length === 0 && (
            <p className="px-3 py-2.5 text-[11px] text-[#7D938A]">Tidak ada hasil untuk “{query}”</p>
          )}
          {!loading &&
            GROUP_ORDER.map(({ key, label }) => {
              const rows = groups[key];
              if (!rows.length) return null;
              return (
                <div key={key} className="py-1">
                  <p className="px-3 pt-1.5 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7D938A]">
                    {label}
                  </p>
                  {rows.map((hit) => (
                    <button
                      key={`${hit.screen}-${hit.id || hit.title}`}
                      type="button"
                      onClick={() => {
                        onSelect(hit.screen, hit.id);
                        setQuery('');
                        setOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#F3F6F4] cursor-pointer"
                    >
                      <span className="block text-xs font-bold text-[#16211D]">{hit.title}</span>
                      <span className="block text-[10px] text-[#7D938A] truncate">{hit.subtitle}</span>
                    </button>
                  ))}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
