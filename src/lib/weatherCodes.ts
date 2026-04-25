export type WeatherKind =
  | "clear"
  | "moon"
  | "partly"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm";

export type WeatherMeta = {
  label: string;
  kind: WeatherKind;
  tone: "sun" | "cloud" | "rain" | "snow" | "storm" | "fog";
};

export function getWeatherMeta(code: number, isDay = true): WeatherMeta {
  if (code === 0) {
    return {
      label: "Clear",
      kind: isDay ? "clear" : "moon",
      tone: "sun"
    };
  }

  if (code === 1 || code === 2) {
    return {
      label: code === 1 ? "Mostly clear" : "Partly cloudy",
      kind: "partly",
      tone: "cloud"
    };
  }

  if (code === 3) {
    return {
      label: "Overcast",
      kind: "cloud",
      tone: "cloud"
    };
  }

  if (code === 45 || code === 48) {
    return {
      label: "Fog",
      kind: "fog",
      tone: "fog"
    };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      label: "Drizzle",
      kind: "drizzle",
      tone: "rain"
    };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return {
      label: "Rain",
      kind: "rain",
      tone: "rain"
    };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      label: "Snow",
      kind: "snow",
      tone: "snow"
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      label: "Thunderstorms",
      kind: "storm",
      tone: "storm"
    };
  }

  return {
    label: "Mixed conditions",
    kind: "cloud",
    tone: "cloud"
  };
}
