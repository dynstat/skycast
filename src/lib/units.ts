import type { Units } from "./weather";

export function temperatureValue(celsius: number, units: Units): number {
  return units === "imperial" ? celsius * 1.8 + 32 : celsius;
}

export function formatTemperature(celsius: number, units: Units): string {
  return `${Math.round(temperatureValue(celsius, units))}°`;
}

export function windValue(kilometersPerHour: number, units: Units): number {
  return units === "imperial" ? kilometersPerHour * 0.621371 : kilometersPerHour;
}

export function formatWind(kilometersPerHour: number, units: Units): string {
  return `${Math.round(windValue(kilometersPerHour, units))} ${units === "imperial" ? "mph" : "km/h"}`;
}

export function formatPrecipitation(millimeters: number, units: Units): string {
  if (units === "imperial") {
    const inches = millimeters / 25.4;
    return `${inches >= 1 ? inches.toFixed(1) : inches.toFixed(2)} in`;
  }

  return `${millimeters >= 10 ? Math.round(millimeters) : millimeters.toFixed(1)} mm`;
}

export function formatVisibility(meters: number, units: Units): string {
  if (units === "imperial") {
    return `${(meters / 1609.344).toFixed(1)} mi`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatHour(value: string): string {
  const hour = Number(value.slice(11, 13));
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour} ${suffix}`;
}

export function formatClock(value: string): string {
  const hour = Number(value.slice(11, 13));
  const minute = value.slice(14, 16);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

export function formatDay(value: string, short = true): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: short ? "short" : "long",
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}
