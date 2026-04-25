import { WeatherIcon } from "./WeatherIcon";
import type { WeatherKind } from "../lib/weatherCodes";

type WeatherSceneProps = {
  kind: WeatherKind;
  label: string;
};

export function WeatherScene({ kind, label }: WeatherSceneProps) {
  return (
    <div className={`weather-scene weather-scene--${kind}`} aria-label={label} role="img">
      <div className="weather-scene__sun" />
      <div className="weather-scene__cloud weather-scene__cloud--one" />
      <div className="weather-scene__cloud weather-scene__cloud--two" />
      <div className="weather-scene__precip weather-scene__precip--one" />
      <div className="weather-scene__precip weather-scene__precip--two" />
      <WeatherIcon kind={kind} className="weather-scene__icon" size={86} strokeWidth={1.35} />
    </div>
  );
}
