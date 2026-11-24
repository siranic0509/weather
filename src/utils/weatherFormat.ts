import type {WeatherData} from '../types/weather';

export type TempUnit = 'C' | 'F';

export function convertTemp(tempC: number, unit: TempUnit): number {
  if (unit === 'F') {
    return Math.round((tempC * 9) / 5 + 32);
  }
  return Math.round(tempC);
}

export function formatWindDirection(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const directions = ['북풍', '북동풍', '동풍', '남동풍', '남풍', '남서풍', '서풍', '북서풍'];
  const index = Math.round(normalized / 45) % 8;
  return directions[index];
}

export function getHumidityComfort(humidity: number): string {
  if (humidity < 30) return '건조함';
  if (humidity <= 60) return '쾌적함';
  if (humidity <= 75) return '약간 습함';
  return '매우 습함';
}

export function getUvLabel(uv: number | null): string {
  if (uv === null) return '정보 없음';
  if (uv < 3) return '낮음';
  if (uv < 6) return '보통';
  if (uv < 8) return '높음';
  if (uv < 11) return '매우 높음';
  return '위험';
}

export function getDailyGuidance(weather: WeatherData, unit: TempUnit): string {
  const {current, daily} = weather;
  const parts: string[] = [];

  const todayPop = daily[0]?.precipitationProbability ?? 0;
  if (
    current.conditionCode === 'rain' ||
    current.conditionCode === 'heavy-rain' ||
    current.conditionCode === 'drizzle' ||
    current.conditionCode === 'thunderstorm' ||
    todayPop >= 50
  ) {
    parts.push(`강수 확률이 ${todayPop}%로 예보되어 있어 우산을 챙기시는 편이 좋습니다.`);
  } else if (current.conditionCode === 'snow') {
    parts.push('눈 소식이 있습니다. 보행 시 미끄럼에 유의하시고 따뜻하게 입으세요.');
  } else {
    parts.push('비 소식 없이 비교적 안정적인 날씨가 이어집니다.');
  }

  const spreadC = current.tempMaxC - current.tempMinC;
  const displaySpread = unit === 'F' ? Math.round((spreadC * 9) / 5) : spreadC;
  if (spreadC >= 9) {
    parts.push(`일교차가 ${displaySpread}°로 큰 편이니 얇은 겉옷을 겹쳐 입으세요.`);
  } else if (current.tempC <= 5) {
    parts.push('기온이 낮아 쌀쌀하므로 보온에 신경 쓰시기 바랍니다.');
  } else if (current.tempC >= 28) {
    parts.push('기온이 높은 편이니 수분을 충분히 섭취하고 햇볕을 피하세요.');
  } else if (current.windSpeedMs >= 8) {
    parts.push(`바람이 ${current.windSpeedMs} m/s로 다소 강하게 불어 체감 온도가 낮을 수 있습니다.`);
  }

  return parts.join(' ');
}
