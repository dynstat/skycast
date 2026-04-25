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

type WeatherApiResponse = {
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

type AirQualityResponse = {
  hourly?: {
    time: string[];
    us_aqi?: number[];
    pm2_5?: number[];
    pm10?: number[];
    ozone?: number[];
  };
};

const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_BASE = "https://geocoding-api.open-meteo.com/v1";
const AIR_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";

export const DEFAULT_PLACE: Place = {
  id: "5128581",
  name: "New York",
  admin1: "New York",
  country: "United States",
  latitude: 40.7143,
  longitude: -74.006,
  timezone: "America/New_York"
};

export const QUICK_PLACES: Place[] = [
  DEFAULT_PLACE,
  {
    id: "2643743",
    name: "London",
    country: "United Kingdom",
    latitude: 51.5085,
    longitude: -0.1257,
    timezone: "Europe/London"
  },
  {
    id: "2988507",
    name: "Paris",
    country: "France",
    latitude: 48.8534,
    longitude: 2.3488,
    timezone: "Europe/Paris"
  },
  {
    id: "1850147",
    name: "Tokyo",
    country: "Japan",
    latitude: 35.6895,
    longitude: 139.6917,
    timezone: "Asia/Tokyo"
  },
  {
    id: "1275339",
    name: "Mumbai",
    admin1: "Maharashtra",
    country: "India",
    latitude: 19.0728,
    longitude: 72.8826,
    timezone: "Asia/Kolkata"
  }
];

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
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
  signal?: AbortSignal
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
    longitude
  };
}

export async function fetchForecast(place: Place, signal?: AbortSignal): Promise<ForecastData> {
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
      "wind_gusts_10m"
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
      "surface_pressure"
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
      "wind_gusts_10m_max"
    ].join(","),
    timezone: "auto",
    forecast_days: "10"
  }).toString();

  const [weather, airQuality] = await Promise.all([
    fetchJson<WeatherApiResponse>(url.toString(), signal),
    fetchAirQuality(place, signal).catch(() => null)
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
      windGusts: safeNumber(weather.current.wind_gusts_10m)
    },
    hourly: mapHourly(weather).slice(0, 36),
    daily: mapDaily(weather),
    airQuality,
    updatedAt: new Date().toISOString(),
    timezone: weather.timezone,
    timezoneAbbreviation: weather.timezone_abbreviation,
    elevation: weather.elevation
  };
}

async function fetchAirQuality(place: Place, signal?: AbortSignal): Promise<AirQuality | null> {
  const url = new URL(AIR_BASE);

  url.search = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    hourly: "us_aqi,pm2_5,pm10,ozone",
    timezone: "auto",
    forecast_days: "2"
  }).toString();

  const data = await fetchJson<AirQualityResponse>(url.toString(), signal);
  const hourly = data.hourly;

  if (!hourly?.time?.length) {
    return null;
  }

  const index = nearestHourlyIndex(hourly.time, new Date());
  const aqi = nullableNumber(hourly.us_aqi?.[index]);

  return {
    aqi,
    pm25: nullableNumber(hourly.pm2_5?.[index]),
    pm10: nullableNumber(hourly.pm10?.[index]),
    ozone: nullableNumber(hourly.ozone?.[index]),
    label: getAqiLabel(aqi)
  };
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function mapHourly(weather: WeatherApiResponse): HourlyWeather[] {
  const hourly = weather.hourly;

  return hourly.time.map((time, index) => ({
    time,
    temperature: safeNumber(hourly.temperature_2m[index]),
    apparentTemperature: safeNumber(hourly.apparent_temperature[index]),
    humidity: safeNumber(hourly.relative_humidity_2m[index]),
    precipitationProbability: safeNumber(hourly.precipitation_probability[index]),
    precipitation: safeNumber(hourly.precipitation[index]),
    weatherCode: safeNumber(hourly.weather_code[index]),
    cloudCover: safeNumber(hourly.cloud_cover[index]),
    windSpeed: safeNumber(hourly.wind_speed_10m[index]),
    windGusts: safeNumber(hourly.wind_gusts_10m[index]),
    uvIndex: safeNumber(hourly.uv_index[index]),
    visibility: safeNumber(hourly.visibility[index]),
    pressure: safeNumber(hourly.surface_pressure[index])
  }));
}

function mapDaily(weather: WeatherApiResponse): DailyWeather[] {
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
    precipitationProbabilityMax: safeNumber(daily.precipitation_probability_max[index]),
    windSpeedMax: safeNumber(daily.wind_speed_10m_max[index]),
    windGustsMax: safeNumber(daily.wind_gusts_10m_max[index])
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
    timezone: result.timezone
  };
}

function nearestHourlyIndex(times: string[], now: Date): number {
  const currentHour = now.toISOString().slice(0, 13);
  const exactHour = times.findIndex((time) => time.startsWith(currentHour));

  if (exactHour >= 0) {
    return exactHour;
  }

  return Math.max(0, times.findIndex((time) => time > currentHour));
}

function getAqiLabel(aqi: number | null): string {
  if (aqi === null) return "Unavailable";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
}

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
