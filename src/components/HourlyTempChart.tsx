import {useState} from 'react';
import type {HourlyForecastItem} from '../types/weather';
import {convertTemp, type TempUnit} from '../utils/weatherFormat';

interface HourlyTempChartProps {
  hourly: HourlyForecastItem[];
  unit: TempUnit;
}

export function HourlyTempChart({hourly, unit}: HourlyTempChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const points = hourly.slice(0, 16);

  if (points.length < 2) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-center text-sm text-slate-500">
        시간별 차트 데이터가 부족합니다.
      </div>
    );
  }

  const temps = points.map((p) => convertTemp(p.tempC, unit));
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const paddingRange = Math.max(2, Math.ceil((maxTemp - minTemp) * 0.25));
  const yMin = minTemp - paddingRange;
  const yMax = maxTemp + paddingRange;
  const span = Math.max(1, yMax - yMin);

  const svgWidth = 640;
  const svgHeight = 220;
  const padLeft = 36;
  const padRight = 18;
  const padTop = 26;
  const padBottom = 38;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const coords = points.map((p, i) => {
    const x = padLeft + (i / (points.length - 1)) * plotW;
    const t = convertTemp(p.tempC, unit);
    const y = padTop + plotH - ((t - yMin) / span) * plotH;
    return {x, y, temp: t, item: p, index: i};
  });

  // Smooth cubic bezier path
  let linePath = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const ctrlX = (curr.x + next.x) / 2;
    linePath += ` C ${ctrlX.toFixed(1)} ${curr.y.toFixed(1)}, ${ctrlX.toFixed(1)} ${next.y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  const activePoint = hoveredIdx !== null && coords[hoveredIdx] ? coords[hoveredIdx] : coords[0];
  const gridLevels = [minTemp, Math.round((minTemp + maxTemp) / 2), maxTemp];
  const uniqueGridLevels = Array.from(new Set(gridLevels));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-7 flex flex-col justify-between h-full">
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">기온 및 강수 추이</h2>
          <p className="text-xs text-slate-500 mt-0.5">차트 위에 마우스를 올리면 시간대별 상세 수치를 확인합니다</p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <span className="font-semibold text-slate-900">{activePoint.item.label}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-blue-600 font-semibold">
            {activePoint.temp}°{unit}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-sky-600">강수 {activePoint.item.precipitationProbability}%</span>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-52 select-none overflow-visible"
          role="img"
          aria-label="시간별 기온 및 강수 확률 그래프"
        >
          <defs>
            <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal reference lines */}
          {uniqueGridLevels.map((lvl) => {
            const y = padTop + plotH - ((lvl - yMin) / span) * plotH;
            return (
              <g key={lvl}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px] font-mono"
                >
                  {lvl}°
                </text>
              </g>
            );
          })}

          {/* Precipitation probability bars along bottom */}
          {coords.map((pt) => {
            const pop = pt.item.precipitationProbability;
            if (pop <= 0) return null;
            const barH = Math.max(3, (pop / 100) * 34);
            return (
              <rect
                key={`pop-${pt.index}`}
                x={pt.x - 5}
                y={padTop + plotH - barH}
                width={10}
                height={barH}
                rx={2}
                className="fill-sky-400/35"
              />
            );
          })}

          {/* Area & Line */}
          <path d={areaPath} fill="url(#tempAreaGrad)" />
          <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />

          {/* Active crosshair */}
          <line
            x1={activePoint.x}
            y1={padTop}
            x2={activePoint.x}
            y2={padTop + plotH}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Data nodes */}
          {coords.map((pt) => {
            const isActive = pt.index === activePoint.index;
            return (
              <g key={`pt-${pt.index}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 5 : 2.5}
                  className={isActive ? 'fill-blue-600 stroke-white stroke-2' : 'fill-blue-600'}
                />
                {(pt.index % 3 === 0 || isActive) && (
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    className={`text-[11px] font-mono ${isActive ? 'fill-slate-900 font-semibold' : 'fill-slate-500'}`}
                  >
                    {pt.temp}°
                  </text>
                )}
              </g>
            );
          })}

          {/* X-axis labels */}
          {coords.map((pt) => {
            if (pt.index % 2 !== 0 && pt.index !== coords.length - 1) return null;
            return (
              <text
                key={`xlabel-${pt.index}`}
                x={pt.x}
                y={svgHeight - 10}
                textAnchor="middle"
                className={`text-[11px] font-mono ${
                  pt.index === activePoint.index ? 'fill-slate-900 font-semibold' : 'fill-slate-400'
                }`}
              >
                {pt.item.label}
              </text>
            );
          })}

          {/* Invisible hover columns for smooth scrubbing */}
          {coords.map((pt) => {
            const colW = plotW / coords.length;
            return (
              <rect
                key={`hit-${pt.index}`}
                x={pt.x - colW / 2}
                y={0}
                width={colW}
                height={svgHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIdx(pt.index)}
                onClick={() => setHoveredIdx(pt.index)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
