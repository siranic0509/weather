import type {
  DailyForecastItem,
  GeoLocationResult,
  HourlyForecastItem,
  WeatherConditionCode,
  WeatherData,
} from '../types/weather.ts';

export const PRESET_CITIES: GeoLocationResult[] = [
  {id: 'seoul', name: '서울', admin1: '서울특별시', country: '대한민국', latitude: 37.5665, longitude: 126.978, timezone: 'Asia/Seoul'},
  {id: 'busan', name: '부산', admin1: '부산광역시', country: '대한민국', latitude: 35.1796, longitude: 129.0756, timezone: 'Asia/Seoul'},
  {id: 'jeju', name: '제주', admin1: '제주특별자치도', country: '대한민국', latitude: 33.4996, longitude: 126.5312, timezone: 'Asia/Seoul'},
  {id: 'incheon', name: '인천', admin1: '인천광역시', country: '대한민국', latitude: 37.4563, longitude: 126.7052, timezone: 'Asia/Seoul'},
  {id: 'daegu', name: '대구', admin1: '대구광역시', country: '대한민국', latitude: 35.8714, longitude: 128.6014, timezone: 'Asia/Seoul'},
  {id: 'daejeon', name: '대전', admin1: '대전광역시', country: '대한민국', latitude: 36.3504, longitude: 127.3845, timezone: 'Asia/Seoul'},
  {id: 'gwangju', name: '광주', admin1: '광주광역시', country: '대한민국', latitude: 35.1595, longitude: 126.8526, timezone: 'Asia/Seoul'},
  {id: 'ulsan', name: '울산', admin1: '울산광역시', country: '대한민국', latitude: 35.5384, longitude: 129.3114, timezone: 'Asia/Seoul'},
  {id: 'suwon', name: '수원', admin1: '경기도', country: '대한민국', latitude: 37.2636, longitude: 127.0286, timezone: 'Asia/Seoul'},
  {id: 'tokyo', name: '도쿄', admin1: '도쿄도', country: '일본', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo'},
  {id: 'osaka', name: '오사카', admin1: '오사카부', country: '일본', latitude: 34.6937, longitude: 135.5023, timezone: 'Asia/Tokyo'},
  {id: 'newyork', name: '뉴욕', admin1: '뉴욕주', country: '미국', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York'},
  {id: 'london', name: '런던', admin1: '잉글랜드', country: '영국', latitude: 51.5072, longitude: -0.1276, timezone: 'Europe/London'},
  {id: 'paris', name: '파리', admin1: '일드프랑스', country: '프랑스', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris'},
];

function mapWmoCode(code: number, isDay: boolean): {conditionCode: WeatherConditionCode; conditionLabel: string} {
  if (code === 0) {
    return {conditionCode: isDay ? 'clear-day' : 'clear-night', conditionLabel: '맑음'};
  }
  if (code === 1) {
    return {conditionCode: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', conditionLabel: '대체로 맑음'};
  }
  if (code === 2) {
    return {conditionCode: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', conditionLabel: '구름 조금'};
  }
  if (code === 3) {
    return {conditionCode: 'cloudy', conditionLabel: '흐림'};
  }
  if (code === 45 || code === 48) {
    return {conditionCode: 'fog', conditionLabel: '안개'};
  }
  if (code >= 51 && code <= 57) {
    return {conditionCode: 'drizzle', conditionLabel: '이슬비'};
  }
  if (code === 61 || code === 63 || code === 80 || code === 81) {
    return {conditionCode: 'rain', conditionLabel: '비'};
  }
  if (code === 65 || code === 66 || code === 67 || code === 82) {
    return {conditionCode: 'heavy-rain', conditionLabel: '강한 비'};
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return {conditionCode: 'snow', conditionLabel: '눈'};
  }
  if (code >= 95) {
    return {conditionCode: 'thunderstorm', conditionLabel: '뇌우'};
  }
  return {conditionCode: 'cloudy', conditionLabel: '흐림'};
}

function mapOwmIcon(id: number, icon: string): WeatherConditionCode {
  const isDay = icon.endsWith('d');
  if (id >= 200 && id < 300) return 'thunderstorm';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id >= 500 && id < 505) return id >= 502 ? 'heavy-rain' : 'rain';
  if (id >= 505 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'fog';
  if (id === 800) return isDay ? 'clear-day' : 'clear-night';
  if (id === 801 || id === 802) return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
  return 'cloudy';
}

function mapWeatherApiCode(code: number, isDay: boolean): WeatherConditionCode {
  if (code === 1000) return isDay ? 'clear-day' : 'clear-night';
  if (code === 1003) return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
  if (code === 1006 || code === 1009) return 'cloudy';
  if (code === 1030 || code === 1135 || code === 1147) return 'fog';
  if ([1063, 1150, 1153, 1168, 1171].includes(code)) return 'drizzle';
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'thunderstorm';
  if ([1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264].includes(code)) {
    return 'snow';
  }
  if ([1192, 1195, 1201, 1243, 1246].includes(code)) return 'heavy-rain';
  if ([1180, 1183, 1186, 1189, 1198, 1240].includes(code)) return 'rain';
  return 'cloudy';
}

function formatDaylightDuration(sunriseMs: number, sunsetMs: number): string {
  const diffMinutes = Math.max(0, Math.round((sunsetMs - sunriseMs) / 60000));
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return `${hours}시간 ${mins}분`;
}

function formatTimeFromIso(iso: string): string {
  const match = iso.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : iso.slice(11, 16);
}

function formatHourLabel(iso: string): string {
  const match = iso.match(/T(\d{2}):/);
  if (!match) return iso;
  return `${Number(match[1])}시`;
}

function getKoreanDayLabel(dateStr: string, index: number): {dayLabel: string; dateLabel: string} {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const dayLabel = index === 0 ? '오늘' : index === 1 ? '내일' : weekdays[dt.getUTCDay()];
  const dateLabel = `${m}.${String(d).padStart(2, '0')}`;
  return {dayLabel, dateLabel};
}

function formatOffsetTime(unixSec: number, tzOffsetSec: number): string {
  const d = new Date((unixSec + tzOffsetSec) * 1000);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatOffsetDateKey(unixSec: number, tzOffsetSec: number): string {
  const d = new Date((unixSec + tzOffsetSec) * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const geocodeCache = new Map<string, {expiresAt: number; results: GeoLocationResult[]}>();

const KOREAN_SUBDIVISION_RE = /(동|읍|면|리|구|군|가)$/;
const KOREAN_REGION_PREFIX_RE =
  /^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/;

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  category?: string;
  type?: string;
  name?: string;
  display_name?: string;
  address?: {
    quarter?: string;
    neighbourhood?: string;
    suburb?: string;
    legal?: string;
    village?: string;
    town?: string;
    borough?: string;
    city_district?: string;
    city?: string;
    county?: string;
    state?: string;
    province?: string;
    country?: string;
    country_code?: string;
  };
}

function formatNominatimResult(item: NominatimItem): GeoLocationResult | null {
  const lat = Number(item.lat);
  const lon = Number(item.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const addr = item.address || {};
  const primaryName =
    item.name ||
    addr.legal ||
    addr.quarter ||
    addr.neighbourhood ||
    addr.village ||
    addr.town ||
    addr.borough ||
    addr.city ||
    (item.display_name ? item.display_name.split(',')[0].trim() : '');

  if (!primaryName) return null;

  const cityOrProvince = addr.city || addr.province || addr.state || addr.county || '';
  const district = addr.borough || addr.city_district || addr.suburb || '';
  const adminParts: string[] = [];
  if (cityOrProvince && cityOrProvince !== primaryName) adminParts.push(cityOrProvince);
  if (district && district !== primaryName && district !== cityOrProvince) adminParts.push(district);

  const country = addr.country || (addr.country_code === 'kr' ? '대한민국' : '');

  return {
    id: `osm-${item.place_id}`,
    name: primaryName,
    admin1: adminParts.length > 0 ? adminParts.join(' ') : undefined,
    country,
    latitude: lat,
    longitude: lon,
  };
}

async function fetchNominatimResults(query: string, restrictKr: boolean): Promise<GeoLocationResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('accept-language', 'ko');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '12');
  if (restrictKr) {
    url.searchParams.set('countrycodes', 'kr');
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'SkylineWeatherApp/1.0',
      },
    });
    if (!res.ok) return [];
    const items = (await res.json()) as NominatimItem[];
    if (!Array.isArray(items)) return [];

    const sorted = [...items].sort((a, b) => {
      const score = (it: NominatimItem) => {
        if (it.category === 'boundary' && it.type === 'administrative') return 3;
        if (it.category === 'boundary' && it.type === 'legal') return 3;
        if (it.category === 'place') return 2;
        if (it.category === 'boundary') return 1;
        return 0;
      };
      return score(b) - score(a);
    });

    const formatted: GeoLocationResult[] = [];
    for (const item of sorted) {
      if (item.category && !['boundary', 'place', 'landuse'].includes(item.category)) {
        continue;
      }
      const parsed = formatNominatimResult(item);
      if (!parsed) continue;
      const dup = formatted.some(
        (existing) =>
          existing.name === parsed.name &&
          existing.admin1 === parsed.admin1 &&
          Math.abs(existing.latitude - parsed.latitude) < 0.05 &&
          Math.abs(existing.longitude - parsed.longitude) < 0.05,
      );
      if (!dup) {
        formatted.push(parsed);
      }
    }
    return formatted;
  } catch {
    return [];
  }
}

export async function searchLocations(query: string): Promise<GeoLocationResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return PRESET_CITIES;

  const cacheKey = trimmed.toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  const lower = trimmed.toLowerCase();
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const looksLikeKoreanSubdivision =
    tokens.length > 1 ||
    KOREAN_SUBDIVISION_RE.test(trimmed) ||
    KOREAN_REGION_PREFIX_RE.test(trimmed);

  const presetMatches =
    tokens.length === 1 && !KOREAN_SUBDIVISION_RE.test(trimmed)
      ? PRESET_CITIES.filter(
          (c) =>
            c.name.toLowerCase().includes(lower) ||
            (c.admin1 && c.admin1.toLowerCase().includes(lower)) ||
            c.id.toLowerCase().includes(lower),
        )
      : [];

  const omUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
  omUrl.searchParams.set('name', trimmed);
  omUrl.searchParams.set('count', '8');
  omUrl.searchParams.set('language', 'ko');
  omUrl.searchParams.set('format', 'json');

  const [nominatimPrimary, openMeteoRes] = await Promise.all([
    fetchNominatimResults(trimmed, looksLikeKoreanSubdivision),
    fetch(omUrl.toString()).catch(() => null),
  ]);

  let nominatimResults = nominatimPrimary;
  if (nominatimResults.length === 0 && looksLikeKoreanSubdivision) {
    nominatimResults = await fetchNominatimResults(trimmed, false);
  }

  const openMeteoResults: GeoLocationResult[] = [];
  if (openMeteoRes && openMeteoRes.ok) {
    const json = (await openMeteoRes.json()) as {
      results?: Array<{
        id: number;
        name: string;
        country?: string;
        admin1?: string;
        latitude: number;
        longitude: number;
        timezone?: string;
      }>;
    };
    if (json.results && json.results.length > 0) {
      for (const item of json.results) {
        openMeteoResults.push({
          id: String(item.id),
          name: item.name,
          country: item.country || '',
          admin1: item.admin1,
          latitude: item.latitude,
          longitude: item.longitude,
          timezone: item.timezone,
        });
      }
    }
  }

  const combined: GeoLocationResult[] = [];
  const pushUnique = (candidate: GeoLocationResult) => {
    const dup = combined.some(
      (existing) =>
        existing.name === candidate.name &&
        Math.abs(existing.latitude - candidate.latitude) < 0.05 &&
        Math.abs(existing.longitude - candidate.longitude) < 0.05,
    );
    if (!dup) combined.push(candidate);
  };

  presetMatches.forEach(pushUnique);
  nominatimResults.forEach(pushUnique);
  openMeteoResults.forEach(pushUnique);

  const finalResults = combined.slice(0, 10);
  geocodeCache.set(cacheKey, {expiresAt: Date.now() + 5 * 60 * 1000, results: finalResults});
  return finalResults;
}

async function fetchOpenMeteoWeather(loc: {
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
}): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(loc.latitude));
  url.searchParams.set('longitude', String(loc.longitude));
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m',
  );
  url.searchParams.set(
    'hourly',
    'temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index,is_day,visibility',
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max',
  );
  url.searchParams.set('wind_speed_unit', 'ms');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open-Meteo 응답 오류 (${res.status})`);
  }

  const data = (await res.json()) as {
    timezone: string;
    current: {
      time: string;
      temperature_2m: number;
      relative_humidity_2m: number;
      apparent_temperature: number;
      is_day: number;
      precipitation: number;
      weather_code: number;
      cloud_cover: number;
      surface_pressure: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
    };
    hourly: {
      time: string[];
      temperature_2m: number[];
      apparent_temperature: number[];
      precipitation_probability: number[];
      precipitation: number[];
      weather_code: number[];
      wind_speed_10m: number[];
      uv_index: number[];
      is_day: number[];
      visibility: number[];
    };
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      sunrise: string[];
      sunset: string[];
      precipitation_probability_max: number[];
      uv_index_max: number[];
    };
  };

  const isDay = data.current.is_day === 1;
  const currentCond = mapWmoCode(data.current.weather_code, isDay);

  const currentHourPrefix = data.current.time.slice(0, 13);
  let startIdx = data.hourly.time.findIndex((t) => t.startsWith(currentHourPrefix));
  if (startIdx === -1) startIdx = 0;

  const hourly: HourlyForecastItem[] = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, data.hourly.time.length); i++) {
    const hIsDay = data.hourly.is_day[i] === 1;
    const cond = mapWmoCode(data.hourly.weather_code[i], hIsDay);
    hourly.push({
      time: data.hourly.time[i],
      label: i === startIdx ? '지금' : formatHourLabel(data.hourly.time[i]),
      tempC: Math.round(data.hourly.temperature_2m[i]),
      feelsLikeC: Math.round(data.hourly.apparent_temperature[i]),
      precipitationProbability: data.hourly.precipitation_probability[i] ?? 0,
      precipitationMm: Number((data.hourly.precipitation[i] ?? 0).toFixed(1)),
      conditionCode: cond.conditionCode,
      conditionLabel: cond.conditionLabel,
      windSpeedMs: Number((data.hourly.wind_speed_10m[i] ?? 0).toFixed(1)),
    });
  }

  const daily: DailyForecastItem[] = data.daily.time.map((dateStr, idx) => {
    const {dayLabel, dateLabel} = getKoreanDayLabel(dateStr, idx);
    const cond = mapWmoCode(data.daily.weather_code[idx], true);
    return {
      date: dateStr,
      dayLabel,
      dateLabel,
      tempMinC: Math.round(data.daily.temperature_2m_min[idx]),
      tempMaxC: Math.round(data.daily.temperature_2m_max[idx]),
      precipitationProbability: data.daily.precipitation_probability_max[idx] ?? 0,
      conditionCode: cond.conditionCode,
      conditionLabel: cond.conditionLabel,
    };
  });

  const sunriseStr = data.daily.sunrise[0] || '';
  const sunsetStr = data.daily.sunset[0] || '';
  const sunriseMs = sunriseStr ? new Date(sunriseStr).getTime() : 0;
  const sunsetMs = sunsetStr ? new Date(sunsetStr).getTime() : 0;

  const currentVisibilityM = data.hourly.visibility?.[startIdx];
  const currentUv = data.hourly.uv_index?.[startIdx];

  return {
    provider: 'open-meteo',
    providerLabel: 'Open-Meteo',
    hasCustomKey: false,
    location: {
      name: loc.name,
      admin1: loc.admin1,
      country: loc.country,
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: data.timezone,
      localTimeLabel: `${formatTimeFromIso(data.current.time)} 현지 시각`,
    },
    current: {
      tempC: Math.round(data.current.temperature_2m),
      feelsLikeC: Math.round(data.current.apparent_temperature),
      tempMinC: Math.round(data.daily.temperature_2m_min[0]),
      tempMaxC: Math.round(data.daily.temperature_2m_max[0]),
      humidity: Math.round(data.current.relative_humidity_2m),
      windSpeedMs: Number(data.current.wind_speed_10m.toFixed(1)),
      windDirectionDeg: Math.round(data.current.wind_direction_10m),
      pressureHpa: Math.round(data.current.surface_pressure),
      visibilityKm: typeof currentVisibilityM === 'number' ? Number((currentVisibilityM / 1000).toFixed(1)) : null,
      uvIndex: typeof currentUv === 'number' ? Number(currentUv.toFixed(1)) : null,
      cloudCover: Math.round(data.current.cloud_cover),
      precipitationMm: Number(data.current.precipitation.toFixed(1)),
      conditionCode: currentCond.conditionCode,
      conditionLabel: currentCond.conditionLabel,
      isDay,
    },
    astronomy: {
      sunrise: sunriseStr ? formatTimeFromIso(sunriseStr) : '--:--',
      sunset: sunsetStr ? formatTimeFromIso(sunsetStr) : '--:--',
      daylightLabel: sunriseMs && sunsetMs ? formatDaylightDuration(sunriseMs, sunsetMs) : '-',
    },
    hourly,
    daily,
    updatedAt: new Date().toISOString(),
  };
}

async function fetchOpenWeatherMapWeather(
  apiKey: string,
  loc: {name: string; admin1?: string; country: string; latitude: number; longitude: number},
): Promise<WeatherData> {
  const currentUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
  currentUrl.searchParams.set('lat', String(loc.latitude));
  currentUrl.searchParams.set('lon', String(loc.longitude));
  currentUrl.searchParams.set('units', 'metric');
  currentUrl.searchParams.set('lang', 'kr');
  currentUrl.searchParams.set('appid', apiKey);

  const forecastUrl = new URL('https://api.openweathermap.org/data/2.5/forecast');
  forecastUrl.searchParams.set('lat', String(loc.latitude));
  forecastUrl.searchParams.set('lon', String(loc.longitude));
  forecastUrl.searchParams.set('units', 'metric');
  forecastUrl.searchParams.set('lang', 'kr');
  forecastUrl.searchParams.set('appid', apiKey);

  const [curRes, fcRes] = await Promise.all([fetch(currentUrl.toString()), fetch(forecastUrl.toString())]);

  if (curRes.status === 401 || fcRes.status === 401) {
    const err = new Error('OpenWeatherMap API 키가 유효하지 않거나 아직 활성화되지 않았습니다.');
    (err as Error & {statusCode?: number}).statusCode = 401;
    throw err;
  }
  if (!curRes.ok || !fcRes.ok) {
    throw new Error(`OpenWeatherMap 응답 오류 (${curRes.status}/${fcRes.status})`);
  }

  const cur = (await curRes.json()) as {
    name: string;
    timezone: number;
    dt: number;
    visibility?: number;
    clouds?: {all: number};
    rain?: {'1h'?: number};
    snow?: {'1h'?: number};
    weather: Array<{id: number; description: string; icon: string}>;
    main: {temp: number; feels_like: number; temp_min: number; temp_max: number; humidity: number; pressure: number};
    wind: {speed: number; deg?: number};
    sys: {country?: string; sunrise: number; sunset: number};
  };

  const fc = (await fcRes.json()) as {
    city: {timezone: number};
    list: Array<{
      dt: number;
      main: {temp: number; feels_like: number; temp_min: number; temp_max: number};
      weather: Array<{id: number; description: string; icon: string}>;
      wind: {speed: number};
      pop?: number;
      rain?: {'3h'?: number};
      snow?: {'3h'?: number};
    }>;
  };

  const tzOffset = cur.timezone ?? fc.city?.timezone ?? 0;
  const curWeather = cur.weather[0];
  const isDay = curWeather ? curWeather.icon.endsWith('d') : true;

  const hourly: HourlyForecastItem[] = fc.list.slice(0, 8).map((slot) => {
    const w = slot.weather[0];
    const hourStr = formatOffsetTime(slot.dt, tzOffset);
    const hourNum = Number(hourStr.slice(0, 2));
    return {
      time: new Date(slot.dt * 1000).toISOString(),
      label: `${hourNum}시`,
      tempC: Math.round(slot.main.temp),
      feelsLikeC: Math.round(slot.main.feels_like),
      precipitationProbability: Math.round((slot.pop ?? 0) * 100),
      precipitationMm: Number(((slot.rain?.['3h'] ?? 0) + (slot.snow?.['3h'] ?? 0)).toFixed(1)),
      conditionCode: w ? mapOwmIcon(w.id, w.icon) : 'cloudy',
      conditionLabel: w ? w.description : '흐림',
      windSpeedMs: Number(slot.wind.speed.toFixed(1)),
    };
  });

  const dayMap = new Map<
    string,
    {
      tempsMin: number[];
      tempsMax: number[];
      pops: number[];
      icons: Array<{id: number; icon: string; desc: string}>;
    }
  >();

  for (const slot of fc.list) {
    const dateKey = formatOffsetDateKey(slot.dt, tzOffset);
    const entry = dayMap.get(dateKey) || {tempsMin: [], tempsMax: [], pops: [], icons: []};
    entry.tempsMin.push(slot.main.temp_min);
    entry.tempsMax.push(slot.main.temp_max);
    entry.pops.push(Math.round((slot.pop ?? 0) * 100));
    if (slot.weather[0]) {
      entry.icons.push({id: slot.weather[0].id, icon: slot.weather[0].icon, desc: slot.weather[0].description});
    }
    dayMap.set(dateKey, entry);
  }

  const daily: DailyForecastItem[] = Array.from(dayMap.entries())
    .slice(0, 7)
    .map(([dateStr, group], idx) => {
      const {dayLabel, dateLabel} = getKoreanDayLabel(dateStr, idx);
      const midIcon = group.icons[Math.floor(group.icons.length / 2)] || group.icons[0];
      return {
        date: dateStr,
        dayLabel,
        dateLabel,
        tempMinC: Math.round(Math.min(...group.tempsMin)),
        tempMaxC: Math.round(Math.max(...group.tempsMax)),
        precipitationProbability: Math.max(...group.pops, 0),
        conditionCode: midIcon ? mapOwmIcon(midIcon.id, midIcon.icon) : 'cloudy',
        conditionLabel: midIcon ? midIcon.desc : '흐림',
      };
    });

  const todayMin = daily[0] ? Math.min(daily[0].tempMinC, Math.round(cur.main.temp_min)) : Math.round(cur.main.temp_min);
  const todayMax = daily[0] ? Math.max(daily[0].tempMaxC, Math.round(cur.main.temp_max)) : Math.round(cur.main.temp_max);

  return {
    provider: 'openweathermap',
    providerLabel: 'OpenWeatherMap',
    hasCustomKey: true,
    location: {
      name: loc.name || cur.name,
      admin1: loc.admin1,
      country: loc.country || cur.sys?.country || '',
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: `UTC${tzOffset >= 0 ? '+' : ''}${Math.round(tzOffset / 3600)}`,
      localTimeLabel: `${formatOffsetTime(cur.dt, tzOffset)} 현지 시각`,
    },
    current: {
      tempC: Math.round(cur.main.temp),
      feelsLikeC: Math.round(cur.main.feels_like),
      tempMinC: todayMin,
      tempMaxC: todayMax,
      humidity: Math.round(cur.main.humidity),
      windSpeedMs: Number(cur.wind.speed.toFixed(1)),
      windDirectionDeg: Math.round(cur.wind.deg ?? 0),
      pressureHpa: Math.round(cur.main.pressure),
      visibilityKm: typeof cur.visibility === 'number' ? Number((cur.visibility / 1000).toFixed(1)) : null,
      uvIndex: null,
      cloudCover: cur.clouds?.all ?? null,
      precipitationMm: Number(((cur.rain?.['1h'] ?? 0) + (cur.snow?.['1h'] ?? 0)).toFixed(1)),
      conditionCode: curWeather ? mapOwmIcon(curWeather.id, curWeather.icon) : 'cloudy',
      conditionLabel: curWeather ? curWeather.description : '흐림',
      isDay,
    },
    astronomy: {
      sunrise: cur.sys?.sunrise ? formatOffsetTime(cur.sys.sunrise, tzOffset) : '--:--',
      sunset: cur.sys?.sunset ? formatOffsetTime(cur.sys.sunset, tzOffset) : '--:--',
      daylightLabel:
        cur.sys?.sunrise && cur.sys?.sunset
          ? formatDaylightDuration(cur.sys.sunrise * 1000, cur.sys.sunset * 1000)
          : '-',
    },
    hourly,
    daily,
    updatedAt: new Date().toISOString(),
  };
}

function parse12HourTo24(time12h: string): string {
  const match = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time12h;
  let hours = Number(match[1]);
  const mins = match[2];
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${mins}`;
}

async function fetchWeatherApiWeather(
  apiKey: string,
  loc: {name: string; admin1?: string; country: string; latitude: number; longitude: number},
): Promise<WeatherData> {
  const url = new URL('https://api.weatherapi.com/v1/forecast.json');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('q', `${loc.latitude},${loc.longitude}`);
  url.searchParams.set('days', '7');
  url.searchParams.set('lang', 'ko');
  url.searchParams.set('aqi', 'no');
  url.searchParams.set('alerts', 'no');

  const res = await fetch(url.toString());
  if (res.status === 401 || res.status === 403) {
    const err = new Error('WeatherAPI 키가 유효하지 않거나 권한이 없습니다.');
    (err as Error & {statusCode?: number}).statusCode = 401;
    throw err;
  }
  if (!res.ok) {
    throw new Error(`WeatherAPI 응답 오류 (${res.status})`);
  }

  const data = (await res.json()) as {
    location: {name: string; region: string; country: string; tz_id: string; localtime: string; localtime_epoch: number};
    current: {
      temp_c: number;
      feelslike_c: number;
      is_day: number;
      condition: {text: string; code: number};
      wind_kph: number;
      wind_degree: number;
      pressure_mb: number;
      precip_mm: number;
      humidity: number;
      cloud: number;
      vis_km: number;
      uv: number;
    };
    forecast: {
      forecastday: Array<{
        date: string;
        day: {
          maxtemp_c: number;
          mintemp_c: number;
          daily_chance_of_rain: number;
          daily_chance_of_snow: number;
          condition: {text: string; code: number};
        };
        astro: {sunrise: string; sunset: string};
        hour: Array<{
          time_epoch: number;
          time: string;
          temp_c: number;
          feelslike_c: number;
          is_day: number;
          condition: {text: string; code: number};
          wind_kph: number;
          precip_mm: number;
          chance_of_rain: number;
          chance_of_snow: number;
        }>;
      }>;
    };
  };

  const allHours = data.forecast.forecastday.flatMap((d) => d.hour);
  const nowEpoch = data.location.localtime_epoch;
  let startIdx = allHours.findIndex((h) => h.time_epoch >= nowEpoch - 1800);
  if (startIdx === -1) startIdx = 0;

  const hourly: HourlyForecastItem[] = allHours.slice(startIdx, startIdx + 24).map((h, idx) => ({
    time: h.time,
    label: idx === 0 ? '지금' : `${Number(h.time.slice(11, 13))}시`,
    tempC: Math.round(h.temp_c),
    feelsLikeC: Math.round(h.feelslike_c),
    precipitationProbability: Math.max(h.chance_of_rain ?? 0, h.chance_of_snow ?? 0),
    precipitationMm: Number(h.precip_mm.toFixed(1)),
    conditionCode: mapWeatherApiCode(h.condition.code, h.is_day === 1),
    conditionLabel: h.condition.text,
    windSpeedMs: Number((h.wind_kph / 3.6).toFixed(1)),
  }));

  const daily: DailyForecastItem[] = data.forecast.forecastday.map((d, idx) => {
    const {dayLabel, dateLabel} = getKoreanDayLabel(d.date, idx);
    return {
      date: d.date,
      dayLabel,
      dateLabel,
      tempMinC: Math.round(d.day.mintemp_c),
      tempMaxC: Math.round(d.day.maxtemp_c),
      precipitationProbability: Math.max(d.day.daily_chance_of_rain ?? 0, d.day.daily_chance_of_snow ?? 0),
      conditionCode: mapWeatherApiCode(d.day.condition.code, true),
      conditionLabel: d.day.condition.text,
    };
  });

  const todayForecast = data.forecast.forecastday[0];
  const sunrise24 = todayForecast?.astro?.sunrise ? parse12HourTo24(todayForecast.astro.sunrise) : '--:--';
  const sunset24 = todayForecast?.astro?.sunset ? parse12HourTo24(todayForecast.astro.sunset) : '--:--';

  let daylightLabel = '-';
  if (sunrise24.includes(':') && sunset24.includes(':')) {
    const [srH, srM] = sunrise24.split(':').map(Number);
    const [ssH, ssM] = sunset24.split(':').map(Number);
    const mins = ssH * 60 + ssM - (srH * 60 + srM);
    if (mins > 0) {
      daylightLabel = `${Math.floor(mins / 60)}시간 ${mins % 60}분`;
    }
  }

  return {
    provider: 'weatherapi',
    providerLabel: 'WeatherAPI',
    hasCustomKey: true,
    location: {
      name: loc.name || data.location.name,
      admin1: loc.admin1 || data.location.region,
      country: loc.country || data.location.country,
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: data.location.tz_id,
      localTimeLabel: `${data.location.localtime.slice(11, 16)} 현지 시각`,
    },
    current: {
      tempC: Math.round(data.current.temp_c),
      feelsLikeC: Math.round(data.current.feelslike_c),
      tempMinC: daily[0]?.tempMinC ?? Math.round(data.current.temp_c),
      tempMaxC: daily[0]?.tempMaxC ?? Math.round(data.current.temp_c),
      humidity: Math.round(data.current.humidity),
      windSpeedMs: Number((data.current.wind_kph / 3.6).toFixed(1)),
      windDirectionDeg: Math.round(data.current.wind_degree),
      pressureHpa: Math.round(data.current.pressure_mb),
      visibilityKm: Number(data.current.vis_km.toFixed(1)),
      uvIndex: Number(data.current.uv.toFixed(1)),
      cloudCover: Math.round(data.current.cloud),
      precipitationMm: Number(data.current.precip_mm.toFixed(1)),
      conditionCode: mapWeatherApiCode(data.current.condition.code, data.current.is_day === 1),
      conditionLabel: data.current.condition.text,
      isDay: data.current.is_day === 1,
    },
    astronomy: {
      sunrise: sunrise24,
      sunset: sunset24,
      daylightLabel,
    },
    hourly,
    daily,
    updatedAt: new Date().toISOString(),
  };
}

export interface WeatherQueryParams {
  lat?: string;
  lon?: string;
  city?: string;
  name?: string;
  admin1?: string;
  country?: string;
}

export async function resolveWeatherRequest(query: WeatherQueryParams): Promise<WeatherData> {
  const latParam = Number(query.lat);
  const lonParam = Number(query.lon);
  const cityParam = typeof query.city === 'string' ? query.city.trim() : '';

  let loc = {
    name: typeof query.name === 'string' && query.name.trim() ? query.name.trim() : '서울',
    admin1: typeof query.admin1 === 'string' && query.admin1.trim() ? query.admin1.trim() : undefined,
    country: typeof query.country === 'string' && query.country.trim() ? query.country.trim() : '대한민국',
    latitude: Number.isFinite(latParam) ? latParam : 37.5665,
    longitude: Number.isFinite(lonParam) ? lonParam : 126.978,
  };

  if (!Number.isFinite(latParam) || !Number.isFinite(lonParam)) {
    if (cityParam) {
      const matches = await searchLocations(cityParam);
      if (matches.length === 0) {
        const err = new Error(`'${cityParam}' 지역을 찾을 수 없습니다.`);
        (err as Error & {statusCode?: number}).statusCode = 404;
        throw err;
      }
      loc = {
        name: matches[0].name,
        admin1: matches[0].admin1,
        country: matches[0].country,
        latitude: matches[0].latitude,
        longitude: matches[0].longitude,
      };
    } else {
      loc.admin1 = '서울특별시';
    }
  } else if (!query.name) {
    loc.name = '현재 위치';
    loc.country = `${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°`;
  }

  const sanitizeKey = (val: string | undefined) =>
    (val || '').trim().replace(/^["']+|["']+$/g, '').trim();

  const openWeatherKey = sanitizeKey(process.env.OPENWEATHER_API_KEY);
  const weatherApiKey = sanitizeKey(process.env.WEATHERAPI_KEY);
  const genericKey = sanitizeKey(process.env.WEATHER_API_KEY);

  const tryOwmThenWeatherApi = async (key: string): Promise<WeatherData> => {
    try {
      return await fetchOpenWeatherMapWeather(key, loc);
    } catch (owmErr) {
      const status = (owmErr as Error & {statusCode?: number}).statusCode;
      if (status === 401) {
        return await fetchWeatherApiWeather(key, loc);
      }
      throw owmErr;
    }
  };

  if (openWeatherKey) {
    try {
      return await tryOwmThenWeatherApi(openWeatherKey);
    } catch (err) {
      const status = (err as Error & {statusCode?: number}).statusCode;
      if (status === 401 || status === 403) {
        const fallback = await fetchOpenMeteoWeather(loc);
        fallback.notice =
          '입력하신 API 키가 아직 활성화되지 않았거나(OpenWeatherMap 신규 키는 발급 후 최대 10분~2시간 소요) 유효하지 않아, 현재 Open-Meteo 실시간 데이터로 표시하고 있습니다.';
        return fallback;
      }
      throw err;
    }
  }

  if (weatherApiKey) {
    try {
      return await fetchWeatherApiWeather(weatherApiKey, loc);
    } catch (err) {
      const status = (err as Error & {statusCode?: number}).statusCode;
      if (status === 401 || status === 403) {
        const fallback = await fetchOpenMeteoWeather(loc);
        fallback.notice =
          '입력하신 WeatherAPI 키가 유효하지 않거나 권한이 없어, 현재 Open-Meteo 실시간 데이터로 표시하고 있습니다.';
        return fallback;
      }
      throw err;
    }
  }

  if (genericKey) {
    try {
      return await tryOwmThenWeatherApi(genericKey);
    } catch (err) {
      const status = (err as Error & {statusCode?: number}).statusCode;
      if (status === 401 || status === 403) {
        const fallback = await fetchOpenMeteoWeather(loc);
        fallback.notice =
          '입력하신 API 키가 아직 활성화되지 않았거나(OpenWeatherMap 신규 키는 발급 후 최대 10분~2시간 소요) 유효하지 않아, 현재 Open-Meteo 실시간 데이터로 표시하고 있습니다.';
        return fallback;
      }
      throw err;
    }
  }

  return await fetchOpenMeteoWeather(loc);
}
