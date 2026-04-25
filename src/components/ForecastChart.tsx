import { useState } from "react";
import type { HourlyWeather, Units } from "../lib/weather";
import { formatHour, temperatureValue, windValue } from "../lib/units";

export type ChartMode = "temperature" | "precipitation" | "wind";

type ForecastChartProps = {
  data: HourlyWeather[];
  mode: ChartMode;
  units: Units;
  onModeChange: (mode: ChartMode) => void;
};

const CHART_WIDTH = 720;
const CHART_HEIGHT = 250;
const PAD_X = 58;
const PAD_Y = 28;

export function ForecastChart({
  data,
  mode,
  units,
  onModeChange,
}: ForecastChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const chartData = data.slice(0, 18);
  const values = chartData.map((item) => getMetricValue(item, mode, units));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, mode === "temperature" ? max - 8 : 0);
  const spread = Math.max(max - min, 1);
  const scaleValues = buildScaleValues(min, max);
  const points = values.map((value, index) => {
    const x =
      PAD_X +
      (index * (CHART_WIDTH - PAD_X * 2)) / Math.max(values.length - 1, 1);
    const y =
      CHART_HEIGHT -
      PAD_Y -
      ((value - min) / spread) * (CHART_HEIGHT - PAD_Y * 2);

    return [x, y] as const;
  });
  const linePath = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const areaPath = `${linePath} L ${CHART_WIDTH - PAD_X} ${CHART_HEIGHT - PAD_Y} L ${PAD_X} ${
    CHART_HEIGHT - PAD_Y
  } Z`;
  const modeLabel = getModeLabel(mode, units);
  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(chartData.length - 1, 0),
  );
  const activePoint = points[safeActiveIndex];
  const activeDatum = chartData[safeActiveIndex];
  const activeValue = values[safeActiveIndex];

  return (
    <section className="panel chart-panel" aria-label="Forecast chart">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Trend desk</p>
          <h2>{modeLabel.title}</h2>
        </div>
        <div className="segmented-control" aria-label="Chart metric">
          {(["temperature", "precipitation", "wind"] as ChartMode[]).map(
            (chartMode) => (
              <button
                key={chartMode}
                type="button"
                className={mode === chartMode ? "is-active" : ""}
                onClick={() => onModeChange(chartMode)}
              >
                {getModeLabel(chartMode, units).button}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="chart-shell">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label={modeLabel.title}
        >
          <defs>
            <linearGradient
              id={`chart-area-${mode}`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor="var(--chart)" stopOpacity="0.42" />
              <stop offset="100%" stopColor="var(--chart)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {scaleValues.map((scaleValue) => {
            const y =
              CHART_HEIGHT -
              PAD_Y -
              ((scaleValue - min) / spread) * (CHART_HEIGHT - PAD_Y * 2);

            return (
              <g key={scaleValue}>
                <line
                  x1={PAD_X}
                  x2={CHART_WIDTH - PAD_X}
                  y1={y}
                  y2={y}
                  className="chart-grid"
                />
                <text
                  x={PAD_X - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="chart-scale-label"
                >
                  {formatMetric(scaleValue, mode, units)}
                </text>
              </g>
            );
          })}

          <path
            d={areaPath}
            className="chart-area"
            fill={`url(#chart-area-${mode})`}
          />
          <path d={linePath} className="chart-line" />
          {points.map(([x, y], index) => (
            <g key={chartData[index]?.time ?? index}>
              <line
                x1={x}
                x2={x}
                y1={PAD_Y}
                y2={CHART_HEIGHT - PAD_Y}
                className={`chart-hover-line ${safeActiveIndex === index ? "is-active" : ""}`}
              />
              <circle
                cx={x}
                cy={y}
                r={safeActiveIndex === index ? "6.5" : "4.5"}
                className={`chart-dot ${safeActiveIndex === index ? "is-active" : ""}`}
              />
              <circle
                cx={x}
                cy={y}
                r="15"
                className="chart-hit"
                tabIndex={0}
                role="button"
                aria-label={`${formatHour(chartData[index].time)} ${formatMetric(values[index], mode, units)}`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
              >
                <title>
                  {formatHour(chartData[index].time)}{" "}
                  {formatMetric(values[index], mode, units)}
                </title>
              </circle>
              {index % 4 === 0 && (
                <text
                  x={x}
                  y={CHART_HEIGHT - 6}
                  textAnchor="middle"
                  className="chart-label"
                >
                  {formatHour(chartData[index].time)}
                </text>
              )}
            </g>
          ))}
          {activePoint && activeDatum && (
            <g
              className="chart-tooltip"
              transform={`translate(${activePoint[0]}, ${Math.max(activePoint[1] - 20, 24)})`}
            >
              <rect x="-48" y="-42" width="96" height="34" rx="8" />
              <text
                x="0"
                y="-27"
                textAnchor="middle"
                className="chart-tooltip__time"
              >
                {formatHour(activeDatum.time)}
              </text>
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                className="chart-tooltip__value"
              >
                {formatMetric(activeValue, mode, units)}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="chart-stats">
        <span>
          Peak <strong>{formatMetric(max, mode, units)}</strong>
        </span>
        <span>
          Low <strong>{formatMetric(min, mode, units)}</strong>
        </span>
        <span>
          Next hour{" "}
          <strong>
            {formatMetric(values[1] ?? values[0] ?? 0, mode, units)}
          </strong>
        </span>
      </div>
    </section>
  );
}

function buildScaleValues(min: number, max: number): number[] {
  const steps = 4;

  return Array.from(
    { length: steps + 1 },
    (_, index) => min + ((max - min) * (steps - index)) / steps,
  );
}

function getMetricValue(
  item: HourlyWeather,
  mode: ChartMode,
  units: Units,
): number {
  if (mode === "temperature") {
    return temperatureValue(item.temperature, units);
  }

  if (mode === "precipitation") {
    return item.precipitationProbability;
  }

  return windValue(item.windSpeed, units);
}

function formatMetric(value: number, mode: ChartMode, units: Units): string {
  if (mode === "temperature") {
    return `${Math.round(value)}°`;
  }

  if (mode === "precipitation") {
    return `${Math.round(value)}%`;
  }

  return `${Math.round(value)} ${units === "imperial" ? "mph" : "km/h"}`;
}

function getModeLabel(mode: ChartMode, units: Units) {
  if (mode === "temperature") {
    return {
      title: `Temperature curve (${units === "imperial" ? "°F" : "°C"})`,
      button: "Temp",
    };
  }

  if (mode === "precipitation") {
    return {
      title: "Rain probability",
      button: "Rain",
    };
  }

  return {
    title: `Wind speed (${units === "imperial" ? "mph" : "km/h"})`,
    button: "Wind",
  };
}
