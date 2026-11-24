import {Search, X} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {GeoLocationResult} from '../types/weather';
import type {TempUnit} from '../utils/weatherFormat';

interface CitySearchBarProps {
  savedCities: GeoLocationResult[];
  activeLocation: GeoLocationResult;
  unit: TempUnit;
  onSelectLocation: (loc: GeoLocationResult) => void;
  onUnitChange: (unit: TempUnit) => void;
  onRemoveSavedCity: (id: string) => void;
}

export function CitySearchBar({
  savedCities,
  activeLocation,
  unit,
  onSelectLocation,
  onUnitChange,
  onRemoveSavedCity,
}: CitySearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      setActiveIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = (await res.json()) as {results: GeoLocationResult[]};
          setResults(data.results || []);
          setActiveIndex(-1);
          setIsOpen(true);
        }
      } catch {
        setResults([]);
        setActiveIndex(-1);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({block: 'nearest'});
    }
  }, [activeIndex]);

  const selectLocationItem = (item: GeoLocationResult) => {
    onSelectLocation(item);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'ArrowDown') {
      if (results.length === 0) return;
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
      } else {
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      if (results.length === 0) return;
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(results.length - 1);
      } else {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      }
      return;
    }

    if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        selectLocationItem(results[activeIndex]);
      }
      return;
    }

    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (results.length > 0) {
      const target = activeIndex >= 0 && activeIndex < results.length ? results[activeIndex] : results[0];
      selectLocationItem(target);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = (await res.json()) as {results: GeoLocationResult[]};
        if (data.results && data.results.length > 0) {
          selectLocationItem(data.results[0]);
        } else {
          setResults([]);
          setActiveIndex(-1);
          setIsOpen(true);
        }
      }
    } finally {
      setIsSearching(false);
    }
  };

  const activeDescendantId =
    isOpen && activeIndex >= 0 && results[activeIndex] ? `city-option-${results[activeIndex].id}` : undefined;

  return (
    <section aria-label="도시 검색 및 설정" className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div ref={containerRef} className="relative flex-1 max-w-xl">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls="city-search-listbox"
              aria-activedescendant={activeDescendantId}
              value={query}
              onFocus={() => {
                if (results.length > 0) setIsOpen(true);
              }}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="도시 또는 동네 검색 (예: 대구 남산동, 범어동, 서울, Tokyo)"
              aria-label="도시 또는 동네 이름 검색"
              className="w-full h-11 pl-10 pr-24 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setIsOpen(false);
                  setActiveIndex(-1);
                }}
                aria-label="검색어 지우기"
                className="absolute right-16 p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              검색
            </button>
          </form>

          {isOpen && (
            <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {isSearching ? (
                <div className="px-4 py-3 text-sm text-slate-500">도시를 검색하는 중...</div>
              ) : results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500">검색 결과가 없습니다.</div>
              ) : (
                <ul
                  id="city-search-listbox"
                  role="listbox"
                  className="divide-y divide-slate-100 max-h-72 overflow-y-auto"
                >
                  {results.map((item, idx) => {
                    const isHighlighted = idx === activeIndex;
                    return (
                      <li key={item.id} role="option" aria-selected={isHighlighted} id={`city-option-${item.id}`}>
                        <button
                          ref={(el) => {
                            itemRefs.current[idx] = el;
                          }}
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => selectLocationItem(item)}
                          className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-3 transition-colors ${
                            isHighlighted ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`text-sm font-medium truncate ${
                              isHighlighted ? 'text-blue-900 font-semibold' : 'text-slate-900'
                            }`}
                          >
                            {item.name}
                          </span>
                          <span
                            className={`text-xs shrink-0 ${
                              isHighlighted ? 'text-blue-700' : 'text-slate-500'
                            }`}
                          >
                            {[item.admin1, item.country].filter(Boolean).join(' · ')}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3">
          <div
            role="group"
            aria-label="온도 단위 선택"
            className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl"
          >
            <button
              type="button"
              onClick={() => onUnitChange('C')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 font-mono ${
                unit === 'C'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              °C 섭씨
            </button>
            <button
              type="button"
              onClick={() => onUnitChange('F')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 font-mono ${
                unit === 'F'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              °F 화씨
            </button>
          </div>
        </div>
      </div>

      {/* Quick switch saved cities */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {savedCities.map((city) => {
          const isActive =
            city.name === activeLocation.name &&
            Math.abs(city.latitude - activeLocation.latitude) < 0.05 &&
            Math.abs(city.longitude - activeLocation.longitude) < 0.05;
          return (
            <div
              key={city.id}
              className={`inline-flex items-center rounded-lg border text-xs transition-colors shrink-0 ${
                isActive
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectLocation(city)}
                className="px-3 py-1.5 whitespace-nowrap shrink-0"
              >
                {city.name}
              </button>
              {savedCities.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveSavedCity(city.id)}
                  aria-label={`${city.name} 즐겨찾기 삭제`}
                  className="pr-2 pl-0.5 py-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
