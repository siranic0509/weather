import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from 'lucide-react';
import type {WeatherConditionCode} from '../types/weather';

interface WeatherIconProps {
  code: WeatherConditionCode;
  className?: string;
}

export function WeatherIcon({code, className = 'w-6 h-6'}: WeatherIconProps) {
  switch (code) {
    case 'clear-day':
      return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
    case 'clear-night':
      return <Moon className={`${className} text-indigo-500`} aria-hidden="true" />;
    case 'partly-cloudy-day':
      return <CloudSun className={`${className} text-amber-500`} aria-hidden="true" />;
    case 'partly-cloudy-night':
      return <Cloud className={`${className} text-slate-500`} aria-hidden="true" />;
    case 'cloudy':
      return <Cloud className={`${className} text-slate-500`} aria-hidden="true" />;
    case 'fog':
      return <CloudFog className={`${className} text-slate-400`} aria-hidden="true" />;
    case 'drizzle':
      return <CloudDrizzle className={`${className} text-sky-500`} aria-hidden="true" />;
    case 'rain':
    case 'heavy-rain':
      return <CloudRain className={`${className} text-blue-600`} aria-hidden="true" />;
    case 'snow':
      return <CloudSnow className={`${className} text-sky-400`} aria-hidden="true" />;
    case 'thunderstorm':
      return <CloudLightning className={`${className} text-indigo-600`} aria-hidden="true" />;
    default:
      return <Cloud className={`${className} text-slate-500`} aria-hidden="true" />;
  }
}
