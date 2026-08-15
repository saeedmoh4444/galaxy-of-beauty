'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/trpc';
import {
  Card,
  ErrorAlert,
  Button,
  formatCurrency,
  LEAFLET_TILE_URL,
  LEAFLET_CSS_URL,
  LEAFLET_JS_URL,
} from '@galaxy/ui';

interface Technician {
  id: number;
  name: string;
  avatarUrl: string | null;
  lat: number;
  lng: number;
  city: string;
  rating: number;
  reviewCount: number;
  services: Array<{ id: number; nameAr: string; price: number; categoryId: number }>;
  isAvailable: boolean;
}

interface CityInfo {
  key: string;
  lat: number;
  lng: number;
  nameAr: string;
  nameEn: string;
}

const LEAFLET_READY = typeof window !== 'undefined';

function MapView({
  technicians,
  selectedCity,
  selectedTechnician,
  onSelectTechnician,
}: {
  technicians: Technician[];
  selectedCity: CityInfo | null;
  selectedTechnician: Technician | null;
  onSelectTechnician: (t: Technician | null) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);

  useEffect(() => {
    if (!LEAFLET_READY || !mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    // Initialize map once
    if (!mapInstance.current) {
      const center: [number, number] = selectedCity
        ? [selectedCity.lat, selectedCity.lng]
        : [24.7136, 46.6753];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = L.map(mapRef.current).setView(center, selectedCity ? 13 : 6);
      L.tileLayer(LEAFLET_TILE_URL, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);
      mapInstance.current = map;
    }

    const map = mapInstance.current as {
      removeLayer: (l: unknown) => void;
      setView: (c: [number, number], z: number) => void;
    } | null;
    if (map && L) {
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      technicians.forEach((t) => {
        const isSelected = selectedTechnician?.id === t.id;
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: ${isSelected ? '40px' : '32px'}; height: ${isSelected ? '40px' : '32px'};
            background: ${isSelected ? '#C41E3A' : t.isAvailable ? '#059669' : '#9CA3AF'};
            border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            font-size: ${isSelected ? '18px' : '14px'}; color: white;
            transition: all 0.2s; cursor: pointer;
          "></div>`,
          iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
          iconAnchor: [isSelected ? 20 : 16, isSelected ? 20 : 16],
        });

        const marker = L.marker([t.lat, t.lng], { icon })
          .addTo(map)
          .on('click', () => onSelectTechnician(t));

        if (isSelected) {
          marker
            .bindPopup(
              `<div style="font-family:system-ui;text-align:right;min-width:200px"><strong>${t.name}</strong><br/><span style="font-size:12px;color:#666"> ${t.rating} (${t.reviewCount})</span><br/><span style="font-size:12px;color:#666"> ${t.city}</span></div>`,
            )
            .openPopup();
        }

        markersRef.current.push(marker);
      });
    }
  }, [technicians, selectedCity, selectedTechnician, onSelectTechnician]);

  return <div ref={mapRef} className="h-full w-full" />;
}

export default function SalonMapPage(): JSX.Element {
  const [selectedCityKey, setSelectedCityKey] = useState('riyadh');
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const { data: cities } = api.salonMap.cities.useQuery() as { data: CityInfo[] | undefined };
  const {
    data: technicians,
    isLoading,
    isError,
    refetch,
  } = api.salonMap.explore.useQuery({ city: selectedCityKey }) as {
    data: Technician[] | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const selectedCity = cities?.find((c) => c.key === selectedCityKey) ?? null;
  const techs = technicians ?? [];

  const handleTechnicianSelect = useCallback((t: Technician | null) => {
    setSelectedTechnician((prev) => (prev?.id === t?.id ? null : t));
  }, []);

  return (
    <div className="relative h-[calc(100vh-64px)] md:h-[calc(100vh-64px)]">
      {/* Leaflet CSS + JS from CDN */}
      <link
        rel="stylesheet"
        href={LEAFLET_CSS_URL}
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <Script
        src={LEAFLET_JS_URL}
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        onLoad={() => setLeafletLoaded(true)}
      />

      {/* City Selector Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-edge dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <span className="text-sm font-bold text-text-primary dark:text-gray-300 shrink-0">
              المدن:
            </span>
            {cities?.slice(0, 10).map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  setSelectedCityKey(c.key);
                  setSelectedTechnician(null);
                }}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedCityKey === c.key
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {c.nameAr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-full w-full pt-[52px]">
        {!leafletLoaded || isLoading ? (
          <div className="flex h-full items-center justify-center bg-surface-muted dark:bg-gray-900">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
              <p className="mt-4 text-text-secondary">
                {!leafletLoaded ? 'جاري تحميل الخريطة...' : 'جاري البحث عن فنيات...'}
              </p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center bg-surface-muted dark:bg-gray-900">
            <ErrorAlert message="فشل تحميل الخريطة" onRetry={() => refetch()} />
          </div>
        ) : (
          <MapView
            technicians={techs}
            selectedCity={selectedCity}
            selectedTechnician={selectedTechnician}
            onSelectTechnician={handleTechnicianSelect}
          />
        )}
      </div>

      {/* Technician Detail Panel */}
      {selectedTechnician && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] sm:left-auto sm:right-4 sm:w-80">
          <Card padding="lg" className="shadow-2xl">
            <button
              onClick={() => setSelectedTechnician(null)}
              className="absolute top-3 right-3 text-text-tertiary hover:text-text-secondary text-lg"
            ></button>
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-lg font-bold">
                {selectedTechnician.avatarUrl ? (
                  <Image
                    src={selectedTechnician.avatarUrl}
                    alt=""
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  selectedTechnician.name[0]
                )}
              </div>
              <div>
                <h3 className="font-bold text-text-primary dark:text-gray-100">
                  {selectedTechnician.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span> {selectedTechnician.rating}</span>
                  <span>({selectedTechnician.reviewCount})</span>
                  <span
                    className={`h-2 w-2 rounded-full ${selectedTechnician.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}
                  />
                  <span>{selectedTechnician.isAvailable ? 'متاحة' : 'مشغولة'}</span>
                </div>
              </div>
            </div>
            {/* Services */}
            <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
              {selectedTechnician.services.slice(0, 5).map((s) => (
                <div key={s.id} className="flex justify-between text-xs">
                  <span className="text-text-primary dark:text-gray-300">{s.nameAr}</span>
                  <span className="font-semibold text-brand-600">
                    {formatCurrency(s.price)} ر.س
                  </span>
                </div>
              ))}
            </div>
            <Link href={`/technicians/${selectedTechnician.id}`} className="mt-3 block">
              <Button size="sm" className="w-full">
                عرض الملف الكامل ←
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {/* Stats bar */}
      <div className="absolute bottom-4 right-4 z-[1000] hidden sm:block">
        <div className="rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1.5 text-xs font-medium text-text-secondary shadow">
          {techs.length} فنية · {selectedCity?.nameAr ?? ''}
        </div>
      </div>
    </div>
  );
}
