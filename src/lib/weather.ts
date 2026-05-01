export type Units = "metric" | "imperial";

export type Place = {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type CurrentWeather = {
  time: string;
  temperature: number;
  humidity: number;
  apparentTemperature: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  cloudCover: number;
  pressure: number;
  surfacePressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
};

export type HourlyWeather = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  windSpeed: number;
  windGusts: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
};

export type DailyWeather = {
  date: string;
  weatherCode: number;
  maxTemperature: number;
  minTemperature: number;
  apparentMax: number;
  apparentMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
};

export type AirQuality = {
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  ozone: number | null;
  label: string;
};

export type ForecastData = {
  place: Place;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  airQuality: AirQuality | null;
  updatedAt: string;
  timezone: string;
  timezoneAbbreviation?: string;
  elevation?: number;
};

type GeocodeResult = {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
  population?: number;
};

type GeocodeResponse = {
  results?: GeocodeResult[];
};

type OpenMeteoResponse = {
  timezone: string;
  timezone_abbreviation?: string;
  elevation?: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    cloud_cover: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    uv_index: number[];
    visibility: number[];
    surface_pressure: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
  };
};

type WeatherApiDotComResponse = {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    last_updated_epoch: number;
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      date_epoch: number;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        maxwind_mph: number;
        maxwind_kph: number;
        totalprecip_mm: number;
        totalprecip_in: number;
        totalsnow_cm: number;
        avgvis_km: number;
        avgvis_miles: number;
        avghumidity: number;
        daily_will_it_rain: number;
        daily_chance_of_rain: number;
        daily_will_it_snow: number;
        daily_chance_of_snow: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        uv: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase: string;
        moon_illumination: number;
        is_moon_up: number;
        is_sun_up: number;
      };
      hour: Array<{
        time_epoch: number;
        time: string;
        temp_c: number;
        temp_f: number;
        is_day: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        wind_mph: number;
        wind_kph: number;
        wind_degree: number;
        wind_dir: string;
        pressure_mb: number;
        pressure_in: number;
        precip_mm: number;
        precip_in: number;
        snow_cm: number;
        humidity: number;
        cloud: number;
        feelslike_c: number;
        feelslike_f: number;
        windchill_c: number;
        windchill_f: number;
        heatindex_c: number;
        heatindex_f: number;
        dewpoint_c: number;
        dewpoint_f: number;
        will_it_rain: number;
        chance_of_rain: number;
        will_it_snow: number;
        chance_of_snow: number;
        vis_km: number;
        vis_miles: number;
        gust_mph: number;
        gust_kph: number;
        uv: number;
      }>;
    }>;
  };
};

type AirQualityResponse = {
  hourly?: {
    time: string[];
    pm2_5?: number[];
    pm10?: number[];
    ozone?: number[];
    us_aqi?: number[];
  };
};

type WaqiResponse = {
  status: "ok" | "error";
  data?: {
    aqi?: number | string;
    iaqi?: {
      pm25?: { v?: number };
      pm10?: { v?: number };
      o3?: { v?: number };
    };
  };
};

const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_BASE = "https://geocoding-api.open-meteo.com/v1";
const AIR_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";
const WAQI_BASE = "https://api.waqi.info/feed";
const WEATHER_API_BASE = "https://api.weatherapi.com/v1";
const WAQI_TOKEN = import.meta.env.VITE_WAQI_TOKEN?.trim() ?? "";
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY?.trim() ?? "";

export const DEFAULT_PLACE: Place = {
  id: "1275339",
  name: "Mumbai",
  admin1: "Maharashtra",
  country: "India",
  latitude: 19.0728,
  longitude: 72.8826,
  timezone: "Asia/Kolkata",
};

export const QUICK_PLACES: Place[] = [
  DEFAULT_PLACE,
  {
    id: "1850147",
    name: "Tokyo",
    country: "Japan",
    latitude: 35.6895,
    longitude: 139.6917,
    timezone: "Asia/Tokyo",
  },
  {
    id: "5128581",
    name: "New York",
    admin1: "New York",
    country: "United States",
    latitude: 40.7143,
    longitude: -74.006,
    timezone: "America/New_York",
  },
];

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return [];
  }

  const url = `${GEOCODE_BASE}/search?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`;
  const data = await fetchJson<GeocodeResponse>(url, signal);

  return (data.results ?? [])
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .map(toPlace);
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<Place> {
  const url = `${GEOCODE_BASE}/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`;

  try {
    const data = await fetchJson<GeocodeResponse>(url, signal);
    const first = data.results?.[0];

    if (first) {
      return toPlace(first);
    }
  } catch {
    // Coordinates are still useful if reverse geocoding is unavailable.
  }

  return {
    id: `${latitude.toFixed(4)},${longitude.toFixed(4)}`,
    name: "Current location",
    latitude,
    longitude,
  };
}

export async function fetchForecast(
  place: Place,
  signal?: AbortSignal,
  waqiToken?: string,
  weatherApiKey?: string,
): Promise<ForecastData> {
  const apiKey = weatherApiKey || WEATHER_API_KEY;

  if (apiKey) {
    try {
      return await fetchWeatherApiForecast(place, apiKey, signal, waqiToken);
    } catch {
      // Fall back to Open-Meteo if WeatherAPI.com fails.
    }
  }

  return fetchOpenMeteoForecast(place, signal, waqiToken);
}

async function fetchOpenMeteoForecast(
  place: Place,
  signal?: AbortSignal,
  waqiToken?: string,
): Promise<ForecastData> {
  const url = new URL(FORECAST_BASE);

  url.search = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_gusts_10m",
      "uv_index",
      "visibility",
      "surface_pressure",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "10",
  }).toString();

  const [weather, airQuality] = await Promise.all([
    fetchJson<OpenMeteoResponse>(url.toString(), signal),
    fetchAirQuality(place, signal, waqiToken).catch(() => null),
  ]);

  return {
    place,
    current: {
      time: weather.current.time,
      temperature: safeNumber(weather.current.temperature_2m),
      humidity: safeNumber(weather.current.relative_humidity_2m),
      apparentTemperature: safeNumber(weather.current.apparent_temperature),
      isDay: weather.current.is_day === 1,
      precipitation: safeNumber(weather.current.precipitation),
      rain: safeNumber(weather.current.rain),
      showers: safeNumber(weather.current.showers),
      snowfall: safeNumber(weather.current.snowfall),
      weatherCode: safeNumber(weather.current.weather_code),
      cloudCover: safeNumber(weather.current.cloud_cover),
      pressure: safeNumber(weather.current.pressure_msl),
      surfacePressure: safeNumber(weather.current.surface_pressure),
      windSpeed: safeNumber(weather.current.wind_speed_10m),
      windDirection: safeNumber(weather.current.wind_direction_10m),
      windGusts: safeNumber(weather.current.wind_gusts_10m),
    },
    hourly: mapHourly(weather).slice(0, 36),
    daily: mapDaily(weather),
    airQuality,
    updatedAt: new Date().toISOString(),
    timezone: weather.timezone,
    timezoneAbbreviation: weather.timezone_abbreviation,
    elevation: weather.elevation,
  };
}

async function fetchWeatherApiForecast(
  place: Place,
  apiKey: string,
  signal?: AbortSignal,
  waqiToken?: string,
): Promise<ForecastData> {
  const url = new URL(`${WEATHER_API_BASE}/forecast.json`);

  url.search = new URLSearchParams({
    key: apiKey,
    q: `${place.latitude},${place.longitude}`,
    days: "10",
    aqi: "no",
    alerts: "no",
  }).toString();

  const [weather, airQuality] = await Promise.all([
    fetchJson<WeatherApiDotComResponse>(url.toString(), signal),
    fetchAirQuality(place, signal, waqiToken).catch(() => null),
  ]);

  return {
    place,
    current: {
      time: weather.current.last_updated,
      temperature: weather.current.temp_c,
      humidity: weather.current.humidity,
      apparentTemperature: weather.current.feelslike_c,
      isDay: weather.current.is_day === 1,
      precipitation: weather.current.precip_mm,
      rain: weather.current.precip_mm,
      showers: 0,
      snowfall: 0,
      weatherCode: weather.current.condition.code,
      cloudCover: weather.current.cloud,
      pressure: weather.current.pressure_mb,
      surfacePressure: weather.current.pressure_mb,
      windSpeed: weather.current.wind_kph,
      windDirection: weather.current.wind_degree,
      windGusts: weather.current.gust_kph,
    },
    hourly: weather.forecast.forecastday[0].hour.map((h) => ({
      time: h.time,
      temperature: h.temp_c,
      apparentTemperature: h.feelslike_c,
      humidity: h.humidity,
      precipitationProbability: h.chance_of_rain,
      precipitation: h.precip_mm,
      weatherCode: h.condition.code,
      cloudCover: h.cloud,
      windSpeed: h.wind_kph,
      windGusts: h.gust_kph,
      uvIndex: h.uv,
      visibility: h.vis_km,
      pressure: h.pressure_mb,
    })),
    daily: weather.forecast.forecastday.map((d) => ({
      date: d.date,
      weatherCode: d.day.condition.code,
      maxTemperature: d.day.maxtemp_c,
      minTemperature: d.day.mintemp_c,
      apparentMax: d.day.maxtemp_c,
      apparentMin: d.day.mintemp_c,
      sunrise: d.astro.sunrise,
      sunset: d.astro.sunset,
      uvIndexMax: d.day.uv,
      precipitationSum: d.day.totalprecip_mm,
      precipitationProbabilityMax: d.day.daily_chance_of_rain,
      windSpeedMax: d.day.maxwind_kph,
      windGustsMax: d.day.maxwind_kph,
    })),
    airQuality,
    updatedAt: new Date().toISOString(),
    timezone: weather.location.tz_id,
    timezoneAbbreviation: "",
    elevation: 0,
  };
}

async function fetchAirQuality(
  place: Place,
  signal?: AbortSignal,
  waqiToken?: string,
): Promise<AirQuality | null> {
  const token = waqiToken || WAQI_TOKEN;

  if (token) {
    try {
      return await fetchWaqiAirQuality(place, signal, token);
    } catch {
      // Fall back to the existing source if WAQI is unavailable.
    }
  }

  return fetchOpenMeteoAirQuality(place, signal);
}

async function fetchWaqiAirQuality(
  place: Place,
  signal?: AbortSignal,
  waqiToken?: string,
): Promise<AirQuality | null> {
  const token = waqiToken || WAQI_TOKEN;
  const url = `${WAQI_BASE}/geo:${place.latitude};${place.longitude}/?token=${encodeURIComponent(token)}`;
  const data = await fetchJson<WaqiResponse>(url, signal);

  if (data.status !== "ok" || !data.data) {
    return null;
  }

  const aqi = nullableNumber(data.data.aqi);
  const pm25 = nullableNumber(data.data.iaqi?.pm25?.v);
  const pm10 = nullableNumber(data.data.iaqi?.pm10?.v);
  const ozone = nullableNumber(data.data.iaqi?.o3?.v);

  return {
    aqi,
    pm25,
    pm10,
    ozone,
    label: getAqiLabel(aqi),
  };
}

async function fetchOpenMeteoAirQuality(
  place: Place,
  signal?: AbortSignal,
): Promise<AirQuality | null> {
  const url = new URL(AIR_BASE);

  url.search = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    hourly: "pm2_5,pm10,ozone,us_aqi",
    timezone: "auto",
    forecast_days: "2",
  }).toString();

  const data = await fetchJson<AirQualityResponse>(url.toString(), signal);
  const hourly = data.hourly;

  if (!hourly?.time?.length) {
    return null;
  }

  const index = nearestHourlyIndex(hourly.time, new Date());
  const pm25 = nullableNumber(hourly.pm2_5?.[index]);
  const pm10 = nullableNumber(hourly.pm10?.[index]);
  const ozone = nullableNumber(hourly.ozone?.[index]);

  // Use the native US AQI from Open-Meteo if available, otherwise calculate it.
  const aqi =
    nullableNumber(hourly.us_aqi?.[index]) ?? calculateUsAqi(pm25, pm10);

  return {
    aqi,
    pm25,
    pm10,
    ozone,
    label: getAqiLabel(aqi),
  };
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function mapHourly(weather: OpenMeteoResponse): HourlyWeather[] {
  const hourly = weather.hourly;

  return hourly.time.map((time, index) => ({
    time,
    temperature: safeNumber(hourly.temperature_2m[index]),
    apparentTemperature: safeNumber(hourly.apparent_temperature[index]),
    humidity: safeNumber(hourly.relative_humidity_2m[index]),
    precipitationProbability: safeNumber(
      hourly.precipitation_probability[index],
    ),
    precipitation: safeNumber(hourly.precipitation[index]),
    weatherCode: safeNumber(hourly.weather_code[index]),
    cloudCover: safeNumber(hourly.cloud_cover[index]),
    windSpeed: safeNumber(hourly.wind_speed_10m[index]),
    windGusts: safeNumber(hourly.wind_gusts_10m[index]),
    uvIndex: safeNumber(hourly.uv_index[index]),
    visibility: safeNumber(hourly.visibility[index]),
    pressure: safeNumber(hourly.surface_pressure[index]),
  }));
}

function mapDaily(weather: OpenMeteoResponse): DailyWeather[] {
  const daily = weather.daily;

  return daily.time.map((date, index) => ({
    date,
    weatherCode: safeNumber(daily.weather_code[index]),
    maxTemperature: safeNumber(daily.temperature_2m_max[index]),
    minTemperature: safeNumber(daily.temperature_2m_min[index]),
    apparentMax: safeNumber(daily.apparent_temperature_max[index]),
    apparentMin: safeNumber(daily.apparent_temperature_min[index]),
    sunrise: daily.sunrise[index],
    sunset: daily.sunset[index],
    uvIndexMax: safeNumber(daily.uv_index_max[index]),
    precipitationSum: safeNumber(daily.precipitation_sum[index]),
    precipitationProbabilityMax: safeNumber(
      daily.precipitation_probability_max[index],
    ),
    windSpeedMax: safeNumber(daily.wind_speed_10m_max[index]),
    windGustsMax: safeNumber(daily.wind_gusts_10m_max[index]),
  }));
}

function toPlace(result: GeocodeResult): Place {
  const id = result.id
    ? String(result.id)
    : `${result.latitude.toFixed(4)},${result.longitude.toFixed(4)},${result.name}`;

  return {
    id,
    name: result.name,
    admin1: result.admin1,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

function nearestHourlyIndex(times: string[], now: Date): number {
  const currentHour = now.toISOString().slice(0, 13);
  const exactHour = times.findIndex((time) => time.startsWith(currentHour));

  if (exactHour >= 0) {
    return exactHour;
  }

  return Math.max(
    0,
    times.findIndex((time) => time > currentHour),
  );
}

function getAqiLabel(aqi: number | null): string {
  if (aqi === null) return "Unavailable";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for sensitive groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
}

function calculateUsAqi(
  pm25: number | null,
  pm10: number | null,
): number | null {
  const components = [
    pm25 === null
      ? null
      : calculateAqiFromBreakpoint(truncatePm25(pm25), PM25_BREAKPOINTS),
    pm10 === null
      ? null
      : calculateAqiFromBreakpoint(Math.round(pm10), PM10_BREAKPOINTS),
  ].filter((value): value is number => value !== null);

  if (components.length === 0) {
    return null;
  }

  return Math.max(...components);
}

function calculateAqiFromBreakpoint(
  concentration: number,
  breakpoints: readonly Breakpoint[],
): number | null {
  const matching = breakpoints.find(
    (breakpoint) =>
      concentration >= breakpoint.concLow &&
      concentration <= breakpoint.concHigh,
  );

  if (!matching) {
    const highest = breakpoints[breakpoints.length - 1];

    if (concentration > highest.concHigh) {
      return 500;
    }

    return null;
  }

  const ratio =
    (concentration - matching.concLow) / (matching.concHigh - matching.concLow);

  return Math.round(
    ratio * (matching.aqiHigh - matching.aqiLow) + matching.aqiLow,
  );
}

function truncatePm25(value: number): number {
  return Math.floor(value * 10) / 10;
}

type Breakpoint = {
  aqiLow: number;
  aqiHigh: number;
  concLow: number;
  concHigh: number;
};

const PM25_BREAKPOINTS: readonly Breakpoint[] = [
  { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 12 },
  { aqiLow: 51, aqiHigh: 100, concLow: 12.1, concHigh: 35.4 },
  { aqiLow: 101, aqiHigh: 150, concLow: 35.5, concHigh: 55.4 },
  { aqiLow: 151, aqiHigh: 200, concLow: 55.5, concHigh: 150.4 },
  { aqiLow: 201, aqiHigh: 300, concLow: 150.5, concHigh: 250.4 },
  { aqiLow: 301, aqiHigh: 400, concLow: 250.5, concHigh: 350.4 },
  { aqiLow: 401, aqiHigh: 500, concLow: 350.5, concHigh: 500.4 },
] as const;

const PM10_BREAKPOINTS: readonly Breakpoint[] = [
  { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 54 },
  { aqiLow: 51, aqiHigh: 100, concLow: 55, concHigh: 154 },
  { aqiLow: 101, aqiHigh: 150, concLow: 155, concHigh: 254 },
  { aqiLow: 151, aqiHigh: 200, concLow: 255, concHigh: 354 },
  { aqiLow: 201, aqiHigh: 300, concLow: 355, concHigh: 424 },
  { aqiLow: 301, aqiHigh: 400, concLow: 425, concHigh: 504 },
  { aqiLow: 401, aqiHigh: 500, concLow: 505, concHigh: 604 },
] as const;

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function nullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}
