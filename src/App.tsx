import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Activity,
  CalendarDays,
  Compass,
  Cpu,
  Droplets,
  Eye,
  Gauge,
  LocateFixed,
  MapPin,
  MemoryStick,
  RefreshCw,
  Search,
  Star,
  Sunrise,
  Sunset,
  Thermometer,
  Umbrella,
  Wind,
  X,
  Zap,
  Settings,
} from "lucide-react";
import { ForecastChart, type ChartMode } from "./components/ForecastChart";
import { MetricCard } from "./components/MetricCard";
import { WeatherIcon } from "./components/WeatherIcon";
import { WeatherScene } from "./components/WeatherScene";
import {
  DEFAULT_PLACE,
  QUICK_PLACES,
  fetchForecast,
  reverseGeocode,
  searchPlaces,
  type ForecastData,
  type Place,
  type Units,
} from "./lib/weather";
import { getWeatherMeta } from "./lib/weatherCodes";
import {
  formatClock,
  formatDay,
  formatHour,
  formatPrecipitation,
  formatTemperature,
  formatVisibility,
  formatWind,
} from "./lib/units";

type LoadStatus = "loading" | "ready" | "error";
type UsageStatus = "checking" | "live" | "preview" | "error";

type AppUsage = {
  cpuPercent: number;
  memoryBytes: number;
  virtualMemoryBytes: number;
  pid: number;
  timestampMs: number;
};

const STORAGE_KEYS = {
  place: "skycast.selectedPlace",
  units: "skycast.units",
  favorites: "skycast.favorites",
  waqiToken: "skycast.waqiToken",
  weatherApiKey: "skycast.weatherApiKey",
};

function App() {
  const [selectedPlace, setSelectedPlace] = useStoredState<Place>(
    STORAGE_KEYS.place,
    DEFAULT_PLACE,
  );
  const [units, setUnits] = useStoredState<Units>(STORAGE_KEYS.units, "metric");
  const [favorites, setFavorites] = useStoredState<Place[]>(
    STORAGE_KEYS.favorites,
    [DEFAULT_PLACE],
  );
  const [waqiToken, setWaqiToken] = useStoredState<string>(
    STORAGE_KEYS.waqiToken,
    "",
  );
  const [weatherApiKey, setWeatherApiKey] = useStoredState<string>(
    STORAGE_KEYS.weatherApiKey,
    "",
  );
  const [showSettings, setShowSettings] = useState(false);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>("temperature");
  const { usage, usageStatus } = useAppUsage();

  const loadForecast = useCallback(
    async (place: Place, signal?: AbortSignal) => {
      setStatus("loading");
      setError("");

      try {
        const data = await fetchForecast(
          place,
          signal,
          waqiToken,
          weatherApiKey,
        );

        if (!signal?.aborted) {
          setForecast(data);
          setStatus("ready");
        }
      } catch (loadError) {
        if (signal?.aborted) return;

        setStatus("error");
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load forecast.",
        );
      }
    },
    [waqiToken, weatherApiKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadForecast(selectedPlace, controller.signal);

    return () => controller.abort();
  }, [loadForecast, selectedPlace]);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setSearching(true);
      searchPlaces(trimmed, controller.signal)
        .then((results) => {
          if (!controller.signal.aborted) {
            setSuggestions(results);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setSuggestions([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setSearching(false);
          }
        });
    }, 260);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const currentPlace = forecast?.place ?? selectedPlace;
  const currentMeta = forecast
    ? getWeatherMeta(forecast.current.weatherCode, forecast.current.isDay)
    : getWeatherMeta(0, true);
  const today = forecast?.daily[0];
  const placeIsFavorite = favorites.some((favorite) =>
    isSamePlace(favorite, currentPlace),
  );
  const placeShelf = useMemo(
    () => uniquePlaces([...favorites, ...QUICK_PLACES]).slice(0, 8),
    [favorites],
  );
  const insights = useMemo(
    () => (forecast ? buildInsights(forecast, units) : []),
    [forecast, units],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) return;

    if (suggestions[0]) {
      selectPlace(suggestions[0]);
      return;
    }

    setSearching(true);

    try {
      const results = await searchPlaces(trimmed);

      if (results[0]) {
        selectPlace(results[0]);
      } else {
        setError("No matching locations were found.");
      }
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Location search failed.",
      );
    } finally {
      setSearching(false);
    }
  };

  const selectPlace = (place: Place) => {
    setSelectedPlace(place);
    setQuery("");
    setSuggestions([]);
  };

  const handleRefresh = () => {
    void loadForecast(selectedPlace);
  };

  const handleUseLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Current location is unavailable in this webview.");
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const place = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude,
          );
          setSelectedPlace(place);
        } finally {
          setLocating(false);
        }
      },
      (geoError) => {
        setLocating(false);
        setError(geoError.message || "Unable to read current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000,
      },
    );
  };

  const toggleFavorite = () => {
    setFavorites((current) => {
      if (current.some((favorite) => isSamePlace(favorite, currentPlace))) {
        return current.filter(
          (favorite) => !isSamePlace(favorite, currentPlace),
        );
      }

      return uniquePlaces([currentPlace, ...current]).slice(0, 10);
    });
  };

  return (
    <main className="app-shell">
      <div className="ambient-sky" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <WeatherIcon kind={currentMeta.kind} size={28} strokeWidth={1.7} />
          </div>
          <div>
            <strong>SkyCast</strong>
            <span>Forecast Command Center</span>
          </div>
        </div>

        <form className="search-box" onSubmit={handleSubmit}>
          <Search size={18} strokeWidth={1.8} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => window.setTimeout(() => setSuggestions([]), 140)}
            placeholder="Search city"
            aria-label="Search city"
          />
          <button type="submit" disabled={searching}>
            {searching ? "Searching" : "Search"}
          </button>

          {suggestions.length > 0 && (
            <div className="suggestion-menu">
              {suggestions.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onMouseDown={() => selectPlace(place)}
                >
                  <MapPin size={16} />
                  <span>{formatPlace(place)}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="top-actions">
          <div className="unit-toggle" aria-label="Units">
            <button
              type="button"
              className={units === "metric" ? "is-active" : ""}
              onClick={() => setUnits("metric")}
            >
              °C
            </button>
            <button
              type="button"
              className={units === "imperial" ? "is-active" : ""}
              onClick={() => setUnits("imperial")}
            >
              °F
            </button>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={handleUseLocation}
            title="Current location"
          >
            <LocateFixed size={18} className={locating ? "spin" : ""} />
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={handleRefresh}
            title="Refresh forecast"
          >
            <RefreshCw
              size={18}
              className={status === "loading" ? "spin" : ""}
            />
          </button>
          <button
            className={`icon-button ${placeIsFavorite ? "is-favorite" : ""}`}
            type="button"
            onClick={toggleFavorite}
            title={placeIsFavorite ? "Remove favorite" : "Add favorite"}
          >
            <Star size={18} fill={placeIsFavorite ? "currentColor" : "none"} />
          </button>
          <button
            className={`icon-button ${showSettings ? "is-active" : ""}`}
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {showSettings && (
        <section className="settings-panel panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Application Settings</p>
              <h2>API Configuration</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={() => setShowSettings(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="settings-content">
            <div className="settings-field">
              <label htmlFor="waqi-token">WAQI API Token (Optional)</label>
              <p className="field-desc">
                The app uses Open-Meteo models by default. For higher accuracy
                ground-station readings, get a free token from{" "}
                <a
                  href="https://aqicn.org/data-platform/token/"
                  target="_blank"
                  rel="noreferrer"
                >
                  aqicn.org
                </a>
                .
              </p>
              <div className="token-input-row">
                <input
                  id="waqi-token"
                  type="password"
                  value={waqiToken}
                  onChange={(e) => setWaqiToken(e.target.value)}
                  placeholder="Paste your token here..."
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowSettings(false);
                    handleRefresh();
                  }}
                >
                  Save & Sync
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="weather-api-key">
                WeatherAPI.com Key (Optional)
              </label>
              <p className="field-desc">
                The app uses Open-Meteo by default. For more accurate local
                weather in India, get a free key from{" "}
                <a
                  href="https://www.weatherapi.com/signup.aspx"
                  target="_blank"
                  rel="noreferrer"
                >
                  weatherapi.com
                </a>
                .
              </p>
              <div className="token-input-row">
                <input
                  id="weather-api-key"
                  type="password"
                  value={weatherApiKey}
                  onChange={(e) => setWeatherApiKey(e.target.value)}
                  placeholder="Paste your API key here..."
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowSettings(false);
                    handleRefresh();
                  }}
                >
                  Save & Sync
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="place-shelf" aria-label="Saved locations">
        {placeShelf.map((place) => (
          <button
            key={place.id}
            type="button"
            className={isSamePlace(place, currentPlace) ? "is-active" : ""}
            onClick={() => selectPlace(place)}
          >
            <MapPin size={15} />
            <span>{place.name}</span>
          </button>
        ))}
      </section>

      {error && (
        <div className="system-banner" role="alert">
          <span>{error}</span>
          <button type="button" onClick={handleRefresh}>
            Retry
          </button>
        </div>
      )}

      {!forecast ? (
        <section className="loading-panel panel">
          <RefreshCw className="spin" size={28} />
          <h1>Loading forecast</h1>
          <p>{formatPlace(selectedPlace)}</p>
        </section>
      ) : (
        <section
          className={`dashboard ${status === "loading" ? "is-refreshing" : ""}`}
        >
          <section className={`panel current-panel panel--${currentMeta.tone}`}>
            <div className="current-panel__copy">
              <p className="eyebrow">
                {forecast.timezoneAbbreviation ?? forecast.timezone}
              </p>
              <h1>{formatPlace(currentPlace)}</h1>
              <div className="current-temperature">
                {formatTemperature(forecast.current.temperature, units)}
                <span>{units === "imperial" ? "F" : "C"}</span>
              </div>
              <div className="condition-line">
                <WeatherIcon kind={currentMeta.kind} size={22} />
                <strong>{currentMeta.label}</strong>
                <span>
                  Feels{" "}
                  {formatTemperature(
                    forecast.current.apparentTemperature,
                    units,
                  )}
                </span>
              </div>
            </div>

            <WeatherScene kind={currentMeta.kind} label={currentMeta.label} />

            <div className="sun-cycle">
              <div>
                <Sunrise size={18} />
                <span>{today ? formatClock(today.sunrise) : "--"}</span>
              </div>
              <div>
                <Sunset size={18} />
                <span>{today ? formatClock(today.sunset) : "--"}</span>
              </div>
            </div>
          </section>

          <section className="insight-grid" aria-label="Forecast signals">
            {insights.map((insight) => (
              <article
                key={insight.label}
                className={`insight-card insight-card--${insight.tone}`}
              >
                <span>{insight.label}</span>
                <strong>{insight.value}</strong>
                <p>{insight.detail}</p>
              </article>
            ))}
          </section>

          <section
            className="metrics-grid"
            aria-label="Current weather metrics"
          >
            <MetricCard
              icon={<Droplets size={22} />}
              label="Humidity"
              value={`${Math.round(forecast.current.humidity)}%`}
              detail={`${Math.round(forecast.current.cloudCover)}% cloud cover`}
              accent="blue"
            />
            <MetricCard
              icon={<Wind size={22} />}
              label="Wind"
              value={formatWind(forecast.current.windSpeed, units)}
              detail={`Gusts ${formatWind(forecast.current.windGusts, units)}`}
              accent="teal"
            />
            <MetricCard
              icon={<Gauge size={22} />}
              label="Pressure"
              value={`${Math.round(forecast.current.pressure)} hPa`}
              detail={`${pressureDelta(forecast)} over 3h`}
              accent="green"
            />
            <MetricCard
              icon={<Thermometer size={22} />}
              label="Today"
              value={
                today
                  ? `${formatTemperature(today.maxTemperature, units)} / ${formatTemperature(today.minTemperature, units)}`
                  : "--"
              }
              detail={
                today
                  ? `${Math.round(today.precipitationProbabilityMax)}% rain peak`
                  : "--"
              }
              accent="amber"
            />
            <MetricCard
              icon={<Eye size={22} />}
              label="Visibility"
              value={formatVisibility(
                forecast.hourly[0]?.visibility ?? 0,
                units,
              )}
              detail={`${Math.round(forecast.current.surfacePressure)} hPa surface`}
              accent="coral"
            />
            <MetricCard
              icon={<Zap size={22} />}
              label="UV index"
              value={`${Math.round(today?.uvIndexMax ?? 0)}`}
              detail={uvLabel(today?.uvIndexMax ?? 0)}
              accent="teal"
            />
          </section>

          <ForecastChart
            data={forecast.hourly}
            mode={chartMode}
            units={units}
            onModeChange={setChartMode}
          />

          <section className="panel hourly-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Next 12 hours</p>
                <h2>Hourly watch</h2>
              </div>
              <Umbrella size={22} />
            </div>
            <div className="hourly-strip">
              {forecast.hourly.slice(0, 12).map((hour, index) => {
                const meta = getWeatherMeta(
                  hour.weatherCode,
                  forecast.current.isDay,
                );

                return (
                  <article key={hour.time} className="hour-card">
                    <span>{index === 0 ? "Now" : formatHour(hour.time)}</span>
                    <WeatherIcon kind={meta.kind} size={30} />
                    <strong>
                      {formatTemperature(hour.temperature, units)}
                    </strong>
                    <small>
                      {Math.round(hour.precipitationProbability)}% rain
                    </small>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel daily-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">10-day outlook</p>
                <h2>Daily forecast</h2>
              </div>
              <CalendarDays size={22} />
            </div>
            <div className="daily-list">
              {forecast.daily.map((day) => {
                const meta = getWeatherMeta(day.weatherCode, true);
                const range = getTemperatureRange(
                  day.minTemperature,
                  day.maxTemperature,
                  forecast.daily,
                );

                return (
                  <article key={day.date} className="daily-row">
                    <div className="daily-row__day">
                      <WeatherIcon kind={meta.kind} size={24} />
                      <span>{formatDay(day.date)}</span>
                    </div>
                    <span>{meta.label}</span>
                    <div className="range-bar" aria-hidden="true">
                      <i
                        style={{
                          left: `${range.left}%`,
                          width: `${range.width}%`,
                        }}
                      />
                    </div>
                    <strong>
                      {formatTemperature(day.maxTemperature, units)} /{" "}
                      {formatTemperature(day.minTemperature, units)}
                    </strong>
                    <small>
                      {formatPrecipitation(day.precipitationSum, units)}
                    </small>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="side-stack">
            <section className="panel resource-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Process monitor</p>
                  <h2>App resources</h2>
                </div>
                <Cpu size={22} />
              </div>

              <div className={`usage-status usage-status--${usageStatus}`}>
                <span>
                  {usageStatus === "live"
                    ? "Live"
                    : usageStatus === "preview"
                      ? "Desktop only"
                      : "Checking"}
                </span>
                <strong>{usage ? `PID ${usage.pid}` : "--"}</strong>
              </div>

              <ResourceMeter
                icon={<Cpu size={18} />}
                label="CPU"
                fill={usage ? Math.min(Math.max(usage.cpuPercent, 0), 100) : 0}
                display={usage ? `${usage.cpuPercent.toFixed(1)}%` : "--"}
                tone="teal"
              />
              <ResourceMeter
                icon={<MemoryStick size={18} />}
                label="RAM"
                fill={usage ? memoryFill(usage.memoryBytes) : 0}
                display={usage ? formatBytes(usage.memoryBytes) : "--"}
                tone="amber"
              />

              <div className="resource-foot">
                <span>Refresh</span>
                <strong>2 seconds</strong>
                <span>Virtual</span>
                <strong>
                  {usage ? formatBytes(usage.virtualMemoryBytes) : "--"}
                </strong>
                <span>Sample</span>
                <strong>
                  {usage ? formatUpdated(usage.timestampMs) : "--"}
                </strong>
              </div>
            </section>

            <section className="panel side-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Atmosphere</p>
                  <h2>Air and motion</h2>
                </div>
                <Activity size={22} />
              </div>

              <div className="aqi-dial">
                <span>AQI</span>
                <strong>{forecast.airQuality?.aqi ?? "--"}</strong>
                <p>{forecast.airQuality?.label ?? "Unavailable"}</p>
              </div>

              <div className="side-list">
                <div>
                  <span>PM2.5</span>
                  <strong>
                    {forecast.airQuality?.pm25?.toFixed(1) ?? "--"} ug/m3
                  </strong>
                </div>
                <div>
                  <span>PM10</span>
                  <strong>
                    {forecast.airQuality?.pm10?.toFixed(1) ?? "--"} ug/m3
                  </strong>
                </div>
                <div>
                  <span>Ozone</span>
                  <strong>
                    {forecast.airQuality?.ozone?.toFixed(0) ?? "--"} ug/m3
                  </strong>
                </div>
                <div>
                  <span>Wind direction</span>
                  <strong>
                    <Compass size={15} />{" "}
                    {compassDirection(forecast.current.windDirection)}
                  </strong>
                </div>
                <div>
                  <span>Elevation</span>
                  <strong>
                    {forecast.elevation
                      ? `${Math.round(forecast.elevation)} m`
                      : "--"}
                  </strong>
                </div>
                <div>
                  <span>Updated</span>
                  <strong>{formatUpdated(forecast.updatedAt)}</strong>
                </div>
              </div>
            </section>
          </aside>
        </section>
      )}
    </main>
  );
}

function useStoredState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const rawValue = localStorage.getItem(key);
      return rawValue ? (JSON.parse(rawValue) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function useAppUsage() {
  const [usage, setUsage] = useState<AppUsage | null>(null);
  const [usageStatus, setUsageStatus] = useState<UsageStatus>("checking");

  useEffect(() => {
    const tauriWindow = window as Window & { __TAURI_INTERNALS__?: unknown };

    if (!tauriWindow.__TAURI_INTERNALS__) {
      setUsageStatus("preview");
      return;
    }

    let cancelled = false;

    const readUsage = async () => {
      try {
        const nextUsage = await invoke<AppUsage>("get_app_usage");

        if (!cancelled) {
          setUsage(nextUsage);
          setUsageStatus("live");
        }
      } catch {
        if (!cancelled) {
          setUsageStatus("error");
        }
      }
    };

    void readUsage();
    const interval = window.setInterval(readUsage, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return { usage, usageStatus };
}

function ResourceMeter({
  icon,
  label,
  fill,
  display,
  tone,
}: {
  icon: ReactNode;
  label: string;
  fill: number;
  display: string;
  tone: "teal" | "amber";
}) {
  return (
    <div className={`resource-meter resource-meter--${tone}`}>
      <div className="resource-meter__label">
        <span>
          {icon}
          {label}
        </span>
        <strong>{display}</strong>
      </div>
      <div className="resource-meter__track" aria-hidden="true">
        <i style={{ width: `${Math.max(3, Math.min(fill, 100))}%` }} />
      </div>
    </div>
  );
}

function buildInsights(forecast: ForecastData, units: Units) {
  const nextRain = forecast.hourly.find(
    (hour) => hour.precipitationProbability >= 50,
  );
  const topWind = forecast.hourly
    .slice(0, 12)
    .reduce((max, hour) => Math.max(max, hour.windGusts), 0);
  const warmest = forecast.hourly
    .slice(0, 12)
    .reduce(
      (max, hour) => Math.max(max, hour.temperature),
      forecast.hourly[0]?.temperature ?? 0,
    );

  return [
    {
      label: "Rain window",
      value: nextRain ? formatHour(nextRain.time) : "Low",
      detail: nextRain
        ? `${Math.round(nextRain.precipitationProbability)}% probability`
        : "No sharp rain signal",
      tone: "rain",
    },
    {
      label: "Warmest",
      value: formatTemperature(warmest, units),
      detail: "Highest temperature in the next 12 hours",
      tone: "sun",
    },
    {
      label: "Gust ceiling",
      value: formatWind(topWind, units),
      detail:
        topWind > 35 ? "Secure loose outdoor items" : "No strong gust spike",
      tone: "wind",
    },
    {
      label: "Air quality",
      value: forecast.airQuality?.label ?? "Unknown",
      detail: forecast.airQuality?.aqi
        ? `AQI ${forecast.airQuality.aqi}`
        : "No air reading",
      tone: "air",
    },
  ];
}

function isSamePlace(a: Place, b: Place): boolean {
  return (
    a.id === b.id ||
    (Math.abs(a.latitude - b.latitude) < 0.03 &&
      Math.abs(a.longitude - b.longitude) < 0.03)
  );
}

function uniquePlaces(places: Place[]): Place[] {
  return places.reduce<Place[]>((unique, place) => {
    if (!unique.some((existing) => isSamePlace(existing, place))) {
      unique.push(place);
    }

    return unique;
  }, []);
}

function formatPlace(place: Place): string {
  return [place.name, place.admin1, place.country].filter(Boolean).join(", ");
}

function getTemperatureRange(
  min: number,
  max: number,
  days: ForecastData["daily"],
) {
  const allTemperatures = days.flatMap((day) => [
    day.minTemperature,
    day.maxTemperature,
  ]);
  const lowest = Math.min(...allTemperatures);
  const highest = Math.max(...allTemperatures);
  const spread = Math.max(highest - lowest, 1);
  const left = ((min - lowest) / spread) * 100;
  const width = Math.max(((max - min) / spread) * 100, 6);

  return { left, width };
}

function pressureDelta(forecast: ForecastData): string {
  const now = forecast.current.surfacePressure;
  const future = forecast.hourly[3]?.pressure ?? now;
  const delta = future - now;

  if (Math.abs(delta) < 0.5) {
    return "steady";
  }

  return `${delta > 0 ? "+" : ""}${delta.toFixed(1)} hPa`;
}

function uvLabel(value: number): string {
  if (value < 3) return "Low";
  if (value < 6) return "Moderate";
  if (value < 8) return "High";
  if (value < 11) return "Very high";
  return "Extreme";
}

function compassDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8];
}

function formatUpdated(value: string | number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatBytes(bytes: number): string {
  const megabytes = bytes / 1048576;

  if (megabytes < 1024) {
    return `${megabytes >= 100 ? megabytes.toFixed(0) : megabytes.toFixed(1)} MB`;
  }

  return `${(megabytes / 1024).toFixed(2)} GB`;
}

function memoryFill(bytes: number): number {
  const megabytes = bytes / 1048576;
  const scale = Math.max(256, Math.ceil(megabytes / 128) * 128);

  return Math.min((megabytes / scale) * 100, 100);
}

export default App;
