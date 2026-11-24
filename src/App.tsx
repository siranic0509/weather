/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Bookmark,
  Compass,
  Droplets,
  Eye,
  LocateFixed,
  RefreshCw,
  Sunrise,
  Sunset,
  Wind,
} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {CitySearchBar} from './components/CitySearchBar';
import {HourlyTempChart} from './components/HourlyTempChart';
import {WeatherIcon} from './components/WeatherIcon';
import type {GeoLocationResult, WeatherData} from './types/weather';
import {
  convertTemp,
  formatWindDirection,
  getDailyGuidance,
  getHumidityComfort,
  getUvLabel,
  type TempUnit,
} from './utils/weatherFormat';

const DEFAULT_CITIES: GeoLocationResult[] = [
  {id: 'seoul', name: '서울', admin1: '서울특별시', country: '대한민국', latitude: 37.5665, longitude: 126.978},
  {id: 'busan', name: '부산', admin1: '부산광역시', country: '대한민국', latitude: 35.1796, longitude: 129.0756},
  {id: 'jeju', name: '제주', admin1: '제주특별자치도', country: '대한민국', latitude: 33.4996, longitude: 126.5312},
  {id: 'tokyo', name: '도쿄', admin1: '도쿄도', country: '일본', latitude: 35.6762, longitude: 139.6503},
  {id: 'newyork', name: '뉴욕', admin1: '뉴욕주', country: '미국', latitude: 40.7128, longitude: -74.006},
];

const SAVED_CITIES_KEY = 'skyline_weather_saved_cities_v1';
const UNIT_STORAGE_KEY = 'skyline_weather_unit_v1';

export default function App() {
  const [savedCities, setSavedCities] = useState<GeoLocationResult[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_CITIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GeoLocationResult[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_CITIES;
  });

  const [unit, setUnit] = useState<TempUnit>(() => {
    try {
      const stored = localStorage.getItem(UNIT_STORAGE_KEY);
      if (stored === 'F' || stored === 'C') return stored;
    } catch {
      // ignore
    }
    return 'C';
  });

  const [selectedLoc, setSelectedLoc] = useState<GeoLocationResult>(savedCities[0] || DEFAULT_CITIES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [locating, setLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_CITIES_KEY, JSON.stringify(savedCities));
    } catch {
      // ignore
    }
  }, [savedCities]);

  useEffect(() => {
    try {
      localStorage.setItem(UNIT_STORAGE_KEY, unit);
    } catch {
      // ignore
    }
  }, [unit]);

  const fetchWeather = useCallback(async (loc: GeoLocationResult) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: String(loc.latitude),
        lon: String(loc.longitude),
        name: loc.name,
        country: loc.country || '',
      });
      if (loc.admin1) params.set('admin1', loc.admin1);

      const res = await fetch(`/api/weather?${params.toString()}`);
      const payload = (await res.json()) as WeatherData & {error?: string};
      if (!res.ok) {
        throw new Error(payload.error || '날씨 정보를 불러오지 못했습니다.');
      }
      setWeather(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : '날씨 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(selectedLoc);
  }, [selectedLoc, fetchWeather]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError('이 브라우저에서는 위치 정보 기능을 지원하지 않습니다.');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setSelectedLoc({
          id: `geo-${pos.coords.latitude.toFixed(3)}-${pos.coords.longitude.toFixed(3)}`,
          name: '현재 위치',
          country: '',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        setLocating(false);
        setError('위치 권한이 거부되었거나 현재 위치를 확인할 수 없습니다. 도시 검색을 이용해 주세요.');
      },
      {enableHighAccuracy: false, timeout: 8000},
    );
  };

  const isSavedCity = useMemo(() => {
    if (!weather) return false;
    return savedCities.some(
      (c) =>
        c.name === weather.location.name &&
        Math.abs(c.latitude - weather.location.latitude) < 0.05 &&
        Math.abs(c.longitude - weather.location.longitude) < 0.05,
    );
  }, [savedCities, weather]);

  const handleToggleFavorite = () => {
    if (!weather) return;
    if (isSavedCity) {
      if (savedCities.length <= 1) return;
      setSavedCities((prev) =>
        prev.filter(
          (c) =>
            !(
              c.name === weather.location.name &&
              Math.abs(c.latitude - weather.location.latitude) < 0.05
            ),
        ),
      );
    } else {
      const nextCity: GeoLocationResult = {
        id: `${weather.location.name}-${Date.now()}`,
        name: weather.location.name,
        admin1: weather.location.admin1,
        country: weather.location.country,
        latitude: weather.location.latitude,
        longitude: weather.location.longitude,
      };
      setSavedCities((prev) => [nextCity, ...prev.slice(0, 7)]);
    }
  };

  const handleRemoveSavedCity = (id: string) => {
    setSavedCities((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((c) => c.id !== id);
    });
  };

  const weeklyRange = useMemo(() => {
    if (!weather || weather.daily.length === 0) return {min: 0, max: 30};
    const mins = weather.daily.map((d) => convertTemp(d.tempMinC, unit));
    const maxs = weather.daily.map((d) => convertTemp(d.tempMaxC, unit));
    return {
      min: Math.min(...mins),
      max: Math.max(...maxs),
    };
  }, [weather, unit]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <a
            href="#current"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            하늘결 날씨
          </a>

          {/* Zone 2: 4 single-line nav links */}
          <nav
            aria-label="페이지 섹션 탐색"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#current"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              현재 날씨
            </a>
            <a
              href="#hourly"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              시간별 예보
            </a>
            <a
              href="#metrics"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              대기 지표
            </a>
            <a
              href="#weekly"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              주간 예보
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <LocateFixed className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{locating ? '위치 확인 중' : '현재 위치'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <CitySearchBar
          savedCities={savedCities}
          activeLocation={selectedLoc}
          unit={unit}
          onSelectLocation={(loc) => setSelectedLoc(loc)}
          onUnitChange={setUnit}
          onRemoveSavedCity={handleRemoveSavedCity}
        />

        {error && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-rose-900">날씨 데이터를 불러오지 못했습니다</p>
              <p className="text-sm text-rose-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchWeather(selectedLoc)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-900 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>다시 시도</span>
            </button>
          </div>
        )}

        {weather?.notice && (
          <div
            role="status"
            className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <p className="text-sm text-amber-900">{weather.notice}</p>
            <button
              type="button"
              onClick={() => fetchWeather(selectedLoc)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-amber-200 hover:bg-amber-100/40 text-amber-900 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>키 다시 확인</span>
            </button>
          </div>
        )}

        {loading && !weather ? (
          <div className="space-y-6 animate-pulse" aria-label="날씨 정보 로딩 중">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 h-72 bg-white border border-slate-200 rounded-2xl p-7" />
              <div className="lg:col-span-7 h-72 bg-white border border-slate-200 rounded-2xl p-7" />
            </div>
            <div className="h-36 bg-white border border-slate-200 rounded-2xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-28 bg-white border border-slate-200 rounded-2xl" />
              <div className="h-28 bg-white border border-slate-200 rounded-2xl" />
              <div className="h-28 bg-white border border-slate-200 rounded-2xl" />
              <div className="h-28 bg-white border border-slate-200 rounded-2xl" />
            </div>
          </div>
        ) : (
          weather && (
            <>
              {/* Hero Weather Stage */}
              <section id="current" aria-label="현재 날씨 요약" className="scroll-mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left: Current Condition Summary */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 md:p-7 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
                          {weather.location.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                          {[weather.location.admin1, weather.location.country]
                            .filter(Boolean)
                            .map((part, idx) => (
                              <span key={`${part}-${idx}`} className="inline-flex items-center gap-1.5">
                                {idx > 0 && <span aria-hidden="true">·</span>}
                                <span>{part}</span>
                              </span>
                            ))}
                          {(weather.location.admin1 || weather.location.country) && (
                            <span aria-hidden="true">·</span>
                          )}
                          <span className="font-mono tabular-nums">{weather.location.localTimeLabel}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={handleToggleFavorite}
                          aria-label={isSavedCity ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
                          title={isSavedCity ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
                          className={`p-2 rounded-lg border transition-colors ${
                            isSavedCity
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSavedCity ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => fetchWeather(selectedLoc)}
                          disabled={loading}
                          aria-label="날씨 새로고침"
                          title="날씨 새로고침"
                          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="my-6 flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <WeatherIcon code={weather.current.conditionCode} className="w-10 h-10" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl md:text-6xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
                            {convertTemp(weather.current.tempC, unit)}°
                          </span>
                          <span className="text-base font-mono text-slate-400">{unit}</span>
                        </div>
                        <p className="text-base font-medium text-slate-700 mt-1">
                          {weather.current.conditionLabel}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 font-mono tabular-nums">
                        <span>체감 {convertTemp(weather.current.feelsLikeC, unit)}°</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>최고 {convertTemp(weather.current.tempMaxC, unit)}°</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>최저 {convertTemp(weather.current.tempMinC, unit)}°</span>
                      </div>

                      <p className="pt-4 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                        {getDailyGuidance(weather, unit)}
                      </p>
                    </div>
                  </div>

                  {/* Right: 24-Hour Temperature Curve */}
                  <div className="lg:col-span-7">
                    <HourlyTempChart hourly={weather.hourly} unit={unit} />
                  </div>
                </div>
              </section>

              {/* Hourly Forecast Strip */}
              <section id="hourly" aria-label="시간별 예보" className="scroll-mt-24">
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex items-baseline justify-between gap-4 mb-5">
                    <h2 className="text-base font-semibold text-slate-900">시간별 예보</h2>
                    <span className="text-xs text-slate-500">기온 및 강수 확률</span>
                  </div>

                  <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
                    {weather.hourly.map((slot, index) => (
                      <div
                        key={`${slot.time}-${index}`}
                        className={`min-w-[74px] flex-1 flex flex-col items-center justify-between py-3 px-2 rounded-xl border transition-colors ${
                          index === 0
                            ? 'bg-blue-50/60 border-blue-200'
                            : 'bg-slate-50/50 border-slate-100'
                        }`}
                      >
                        <span
                          className={`text-xs font-mono tabular-nums ${
                            index === 0 ? 'font-semibold text-blue-700' : 'text-slate-500'
                          }`}
                        >
                          {slot.label}
                        </span>
                        <div className="my-2.5">
                          <WeatherIcon code={slot.conditionCode} className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold font-mono tabular-nums text-slate-900">
                          {convertTemp(slot.tempC, unit)}°
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-sky-600 mt-1 h-4">
                          {slot.precipitationProbability > 0 ? `${slot.precipitationProbability}%` : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 4-Column Key Meteorological Strip */}
              <section id="metrics" aria-label="대기 및 기상 세부 지표" className="scroll-mt-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Humidity */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-medium">상대 습도</span>
                      <Droplets className="w-4 h-4 text-sky-500" aria-hidden="true" />
                    </div>
                    <div className="my-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                        {weather.current.humidity}
                      </span>
                      <span className="text-xs font-mono text-slate-400">%</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>{getHumidityComfort(weather.current.humidity)}</span>
                      {weather.current.cloudCover !== null && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">운량 {weather.current.cloudCover}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Wind & Pressure */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-medium">바람 · 기압</span>
                      <Wind className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    </div>
                    <div className="my-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                        {weather.current.windSpeedMs.toFixed(1)}
                      </span>
                      <span className="text-xs font-mono text-slate-400">m/s</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span>{formatWindDirection(weather.current.windDirectionDeg)}</span>
                      {weather.current.pressureHpa !== null && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{weather.current.pressureHpa} hPa</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* UV & Visibility / Precipitation */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-medium">
                        {weather.current.uvIndex !== null ? '자외선 지수' : '현재 강수량'}
                      </span>
                      <Eye className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    </div>
                    <div className="my-3 flex items-baseline gap-2">
                      {weather.current.uvIndex !== null ? (
                        <>
                          <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                            {weather.current.uvIndex.toFixed(1)}
                          </span>
                          <span className="text-xs font-medium text-amber-700">
                            {getUvLabel(weather.current.uvIndex)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                            {weather.current.precipitationMm.toFixed(1)}
                          </span>
                          <span className="text-xs font-mono text-slate-400">mm/h</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>
                        {weather.current.visibilityKm !== null
                          ? `가시거리 ${weather.current.visibilityKm} km`
                          : '가시거리 양호'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        강수 {weather.current.precipitationMm.toFixed(1)} mm
                      </span>
                    </div>
                  </div>

                  {/* Sunrise & Sunset */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-medium">일출 · 일몰</span>
                      <Sunrise className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    </div>
                    <div className="my-3 flex items-center gap-4 font-mono tabular-nums">
                      <div>
                        <span className="block text-[11px] text-slate-400">일출</span>
                        <span className="text-xl font-bold text-slate-900">{weather.astronomy.sunrise}</span>
                      </div>
                      <span className="text-slate-200" aria-hidden="true">|</span>
                      <div>
                        <span className="block text-[11px] text-slate-400">일몰</span>
                        <span className="text-xl font-bold text-slate-900">{weather.astronomy.sunset}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Sunset className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span>낮 길이 {weather.astronomy.daylightLabel}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 7-Day Weekly Forecast */}
              <section id="weekly" aria-label="주간 예보" className="scroll-mt-24">
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex items-baseline justify-between gap-4 mb-4">
                    <h2 className="text-base font-semibold text-slate-900">주간 예보</h2>
                    <span className="text-xs text-slate-500">일자별 최저 · 최고 기온 분포</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {weather.daily.map((day, idx) => {
                      const dMin = convertTemp(day.tempMinC, unit);
                      const dMax = convertTemp(day.tempMaxC, unit);
                      const totalSpan = Math.max(1, weeklyRange.max - weeklyRange.min);
                      const leftPct = ((dMin - weeklyRange.min) / totalSpan) * 100;
                      const widthPct = Math.max(8, ((dMax - dMin) / totalSpan) * 100);

                      return (
                        <div
                          key={day.date}
                          className="py-3.5 grid grid-cols-12 items-center gap-3 text-sm"
                        >
                          <div className="col-span-3 sm:col-span-2 flex items-baseline gap-2">
                            <span
                              className={`font-medium ${
                                idx === 0 ? 'text-blue-600 font-semibold' : 'text-slate-900'
                              }`}
                            >
                              {day.dayLabel}
                            </span>
                            <span className="text-xs font-mono tabular-nums text-slate-400">
                              {day.dateLabel}
                            </span>
                          </div>

                          <div className="col-span-4 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                            <WeatherIcon code={day.conditionCode} className="w-5 h-5 shrink-0" />
                            <span className="text-slate-700 truncate">{day.conditionLabel}</span>
                          </div>

                          <div className="hidden sm:flex sm:col-span-2 justify-end font-mono tabular-nums text-xs text-sky-600">
                            {day.precipitationProbability > 0 ? `강수 ${day.precipitationProbability}%` : '강수 0%'}
                          </div>

                          <div className="col-span-5 sm:col-span-4 flex items-center gap-3 justify-end">
                            <span className="w-9 text-right font-mono tabular-nums text-slate-500">
                              {dMin}°
                            </span>
                            <svg
                              viewBox="0 0 100 6"
                              preserveAspectRatio="none"
                              aria-hidden="true"
                              className="hidden sm:block flex-1 max-w-32 h-1.5"
                            >
                              <defs>
                                <linearGradient id={`bar-${day.date}`} x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#38BDF8" />
                                  <stop offset="100%" stopColor="#2563EB" />
                                </linearGradient>
                              </defs>
                              <rect x="0" y="0" width="100" height="6" rx="3" fill="#F1F5F9" />
                              <rect
                                x={Math.min(92, Math.max(0, leftPct))}
                                y="0"
                                width={Math.min(100 - Math.max(0, leftPct), widthPct)}
                                height="6"
                                rx="3"
                                fill={`url(#bar-${day.date})`}
                              />
                            </svg>
                            <span className="w-9 text-right font-mono tabular-nums font-semibold text-slate-900">
                              {dMax}°
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </>
          )
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-700">하늘결 날씨</span>
            <span aria-hidden="true">·</span>
            <span>
              데이터 제공:{' '}
              {weather ? weather.providerLabel : '기상 데이터 서버'}
            </span>
          </div>
          {weather && (
            <div className="font-mono tabular-nums text-slate-400">
              업데이트 {new Date(weather.updatedAt).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
