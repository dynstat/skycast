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
const PAD_X = 34;
const PAD_Y = 28;

export function ForecastChart({ data, mode, units, onModeChange }: ForecastChartProps) {
  const chartData = data.slice(0, 18);
  const values = chartData.map((item) => getMetricValue(item, mode, units));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, mode === "temperature" ? max - 8 : 0);
  const spread = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = PAD_X + (index * (CHART_WIDTH - PAD_X * 2)) / Math.max(values.length - 1, 1);
    const y = CHART_HEIGHT - PAD_Y - ((value - min) / spread) * (CHART_HEIGHT - PAD_Y * 2);

    return [x, y] as const;
  });
  const linePath = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${CHART_WIDTH - PAD_X} ${CHART_HEIGHT - PAD_Y} L ${PAD_X} ${
    CHART_HEIGHT - PAD_Y
  } Z`;
  const modeLabel = getModeLabel(mode, units);

  return (
    <section className="panel chart-panel" aria-label="Forecast chart">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Trend desk</p>
          <h2>{modeLabel.title}</h2>
        </div>
        <div className="segmented-control" aria-label="Chart metric">
          {(["temperature", "precipitation", "wind"] as ChartMode[]).map((chartMode) => (
            <button
              key={chartMode}
              type="button"
              className={mode === chartMode ? "is-active" : ""}
              onClick={() => onModeChange(chartMode)}
            >
              {getModeLabel(chartMode, units).button}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-shell">
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label={modeLabel.title}>
          <defs>
            <linearGradient id={`chart-area-${mode}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--chart)" stopOpacity="0.42" />
              <stop offset="100%" stopColor="var(--chart)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((line) => {
            const y = PAD_Y + (line * (CHART_HEIGHT - PAD_Y * 2)) / 3;
            return <line key={line} x1={PAD_X} x2={CHART_WIDTH - PAD_X} y1={y} y2={y} className="chart-grid" />;
          })}
          <path d={areaPath} className="chart-area" fill={`url(#chart-area-${mode})`} />
          <path d={linePath} className="chart-line" />
          {points.map(([x, y], index) => (
            <g key={chartData[index]?.time ?? index}>
              <circle cx={x} cy={y} r="4.5" className="chart-dot" />
              {index % 4 === 0 && (
                <text x={x} y={CHART_HEIGHT - 6} textAnchor="middle" className="chart-label">
                  {formatHour(chartData[index].time)}
                </text>
              )}
            </g>
          ))}
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
          Next hour <strong>{formatMetric(values[1] ?? values[0] ?? 0, mode, units)}</strong>
        </span>
      </div>
    </section>
  );
}

function getMetricValue(item: HourlyWeather, mode: ChartMode, units: Units): number {
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
    return `${Math.round(value)}deg`;
  }

  if (mode === "precipitation") {
    return `${Math.round(value)}%`;
  }

  return `${Math.round(value)} ${units === "imperial" ? "mph" : "km/h"}`;
}

function getModeLabel(mode: ChartMode, units: Units) {
  if (mode === "temperature") {
    return {
      title: `Temperature curve (${units === "imperial" ? "degF" : "degC"})`,
      button: "Temp"
    };
  }

  if (mode === "precipitation") {
    return {
      title: "Rain probability",
      button: "Rain"
    };
  }

  return {
    title: `Wind speed (${units === "imperial" ? "mph" : "km/h"})`,
    button: "Wind"
  };
}
