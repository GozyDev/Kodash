"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ config }: { config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, configItem]) => configItem.theme || configItem.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .map(([key, configItem]) => {
            const color = configItem.color;
            return color ? `--color-${key}: ${color};` : null;
          })
          .join(""),
      }}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
}: {
  active?: boolean;
  payload?: Array<{
    name?: string | number;
    dataKey?: string | number;
    color?: string;
    value?: string | number;
    payload?: { status?: string };
  }>;
  className?: string;
  indicator?: "line" | "dot" | "dashed";
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-cardC px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {payload.map((item, index) => {
        const key = String(item.name || item.dataKey || "value");
        const itemConfig = config[key] || config[String(item.payload?.status)] || {};
        const indicatorColor =
          item.color || (item.payload?.status ? `var(--color-${item.payload.status})` : "currentColor");

        return (
          <div key={index} className="flex w-full items-center gap-2">
            {indicator === "dot" ? (
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: indicatorColor }}
              />
            ) : null}
            <div className="flex flex-1 items-center justify-between leading-none">
              <span className="text-muted-foreground">
                {itemConfig.label ?? key}
              </span>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {item.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };
