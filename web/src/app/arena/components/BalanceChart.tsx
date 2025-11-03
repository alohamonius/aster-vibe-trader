"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { BalanceHistoryPoint, ArenaAgent } from "@/lib/arenaApi";
import { getProviderLogo } from "@/lib/utils";

interface BalanceChartProps {
  data: BalanceHistoryPoint[];
  agents: ArenaAgent[];
}

export function BalanceChart({ data, agents }: BalanceChartProps) {
  // State for visible agents (toggle visibility)
  const [visibleAgents, setVisibleAgents] = useState<Set<string>>(
    new Set(agents.map((a) => a.id))
  );

  // Toggle agent visibility
  const toggleAgent = (agentId: string) => {
    setVisibleAgents((prev) => {
      const newSet = new Set(prev);
      // Keep at least one agent visible
      if (newSet.has(agentId) && newSet.size === 1) {
        return prev;
      }
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  // Normalize timestamp to 10-minute intervals
  const normalizeToTenMinutes = (timestamp: number): number => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    const roundedMinutes = Math.floor(minutes / 10) * 10;
    date.setMinutes(roundedMinutes, 0, 0);
    return date.getTime();
  };

  // Process and merge data points with normalized timestamps
  const normalizedData = useMemo(() => {
    const timeMap = new Map<number, any>();

    data.forEach((point) => {
      const normalizedTime = normalizeToTenMinutes(point.timestamp);

      if (!timeMap.has(normalizedTime)) {
        timeMap.set(normalizedTime, { timestamp: normalizedTime });
      }

      const entry = timeMap.get(normalizedTime)!;
      // Copy all agent data from this point
      agents.forEach((agent) => {
        if (point[agent.agentName as keyof BalanceHistoryPoint] !== undefined) {
          entry[agent.agentName] =
            point[agent.agentName as keyof BalanceHistoryPoint];
        }
      });
    });

    return Array.from(timeMap.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }, [data, agents]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const timestamp = payload[0].payload.timestamp;
      const date = new Date(timestamp);

      // Format date as DD/MM/YYYY HH:MM
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const dateStr = `${day}/${month}/${year} ${hours}:${minutes}`;

      return (
        <div className="bg-[var(--arena-card)] border border-[var(--arena-border)] p-3 rounded shadow-lg">
          <div className="text-[var(--arena-text-dim)] text-xs font-mono mb-2">
            {dateStr}
          </div>
          {payload.map((entry: any, index: number) => {
            // Find agent by display name to get provider icon
            const agent = agents.find((a) => a.displayName === entry.name);

            return (
              <div key={index} className="flex items-center gap-2 mb-1">
                {agent && (
                  <Image
                    src={getProviderLogo(agent.provider)}
                    alt={agent.agentName}
                    width={16}
                    height={16}
                    className="flex-shrink-0"
                  />
                )}
                <span className="text-[var(--arena-text)] text-xs font-mono">
                  {entry.name}:
                </span>
                <span className="text-[var(--arena-text)] text-xs font-mono font-semibold">
                  ${entry.value?.toFixed(2) || "0.00"}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = () => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {agents.map((agent) => {
          const isVisible = visibleAgents.has(agent.id);

          return (
            <div
              key={agent.id}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleAgent(agent.id)}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: agent.color,
                  opacity: isVisible ? 1 : 0.3,
                }}
              />
              <span
                className="text-sm font-mono"
                style={{
                  color: "var(--arena-text)",
                  opacity: isVisible ? 1 : 0.5,
                  textDecoration: isVisible ? "none" : "line-through",
                }}
              >
                {agent.displayName}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Format timestamp for X-axis
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format balance for Y-axis
  const formatBalance = (value: number) => {
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="bg-[var(--arena-bg)] rounded-lg px-2 py-4 h-full [&_svg]:outline-none [&_svg]:focus:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={normalizedData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--arena-border)"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="var(--arena-text-dim)"
            tick={{ fill: "var(--arena-text-dim)", fontSize: 11 }}
            tickLine={{ stroke: "var(--arena-border)" }}
          />
          <YAxis
            tickFormatter={formatBalance}
            stroke="var(--arena-text-dim)"
            tick={{ fill: "var(--arena-text-dim)", fontSize: 11 }}
            tickLine={{ stroke: "var(--arena-border)" }}
            domain={[0, "dataMax + 50"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />

          {/* Dynamic Lines for All Agents */}
          {agents
            .filter((agent) => visibleAgents.has(agent.id))
            .map((agent) => {
              return (
                <Line
                  key={agent.id}
                  type="monotone"
                  dataKey={agent.agentName}
                  name={agent.displayName}
                  stroke={agent.color}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: agent.color,
                    strokeWidth: 2,
                    stroke: agent.color,
                  }}
                  connectNulls={true}
                />
              );
            })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
