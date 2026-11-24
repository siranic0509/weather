export type WeatherConditionCode =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'snow'
  | 'thunderstorm';

export type WeatherProvider = 'openweathermap' | 'weatherapi' | 'open-meteo';

export interface GeoLocationResult {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface HourlyForecastItem {
  time: string;
  label: string;
  tempC: number;
  feelsLikeC: number;
  precipitationProbability: number;
  precipitationMm: number;
  conditionCode: WeatherConditionCode;
  conditionLabel: string;
  windSpeedMs: number;
}

export interface DailyForecastItem {
  date: string;
  dayLabel: string;
  dateLabel: string;
  tempMinC: number;
  tempMaxC: number;
  precipitationProbability: number;
  conditionCode: WeatherConditionCode;
  conditionLabel: string;
}

export interface WeatherData {
  provider: WeatherProvider;
  providerLabel: string;
  hasCustomKey: boolean;
  notice?: string;
  location: {
    name: string;
    admin1?: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
    localTimeLabel: string;
  };
  current: {
    tempC: number;
    feelsLikeC: number;
    tempMinC: number;
    tempMaxC: number;
    humidity: number;
    windSpeedMs: number;
    windDirectionDeg: number;
    pressureHpa: number | null;
    visibilityKm: number | null;
    uvIndex: number | null;
    cloudCover: number | null;
    precipitationMm: number;
    conditionCode: WeatherConditionCode;
    conditionLabel: string;
    isDay: boolean;
  };
  astronomy: {
    sunrise: string;
    sunset: string;
    daylightLabel: string;
  };
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  updatedAt: string;
}
