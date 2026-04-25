import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WeatherKind } from "../lib/weatherCodes";

const ICONS: Record<WeatherKind, LucideIcon> = {
  clear: Sun,
  moon: Moon,
  partly: CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning
};

type WeatherIconProps = {
  kind: WeatherKind;
  className?: string;
  size?: number;
  strokeWidth?: number;
};

export function WeatherIcon({
  kind,
  className,
  size = 28,
  strokeWidth = 1.8
}: WeatherIconProps) {
  const Icon = ICONS[kind] ?? CloudMoon;

  return <Icon className={className} size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}
