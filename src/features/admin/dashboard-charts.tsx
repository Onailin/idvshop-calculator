"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardCharts } from "@/types";

type DashboardChartsProps = {
  charts: DashboardCharts;
};

type PieTooltipProps = {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: { fill?: string } }>;
};

function ChartTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0];
  return (
    <div className="rounded-lg border border-brand-blush/50 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-foreground">{entry.name}</p>
      <p className="text-muted-foreground">{entry.value?.toLocaleString("th-TH")} รายการ</p>
    </div>
  );
}

function EmptyChartMessage() {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
      ยังไม่มีข้อมูล
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function DashboardCharts({ charts }: DashboardChartsProps) {
  const categoryChartHeight = Math.max(220, charts.itemsByCategory.length * 36);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="ไอเทมตามประเภท">
        {charts.itemsByType.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={charts.itemsByType}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={2}
              >
                {charts.itemsByType.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChartMessage />
        )}
      </ChartCard>

      <ChartCard title="ไอเทมที่มีรูป vs ไม่มีรูป">
        {charts.imageCoverage.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={charts.imageCoverage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={2}
              >
                {charts.imageCoverage.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChartMessage />
        )}
      </ChartCard>

      <ChartCard title="ไอเทมต่อหมวดหมู่">
        {charts.itemsByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={categoryChartHeight}>
            <BarChart
              data={charts.itemsByCategory}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {charts.itemsByCategory.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChartMessage />
        )}
      </ChartCard>

      <ChartCard title="ไอเทมตามระดับความหายาก">
        {charts.itemsByRarity.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts.itemsByRarity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} width={32} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {charts.itemsByRarity.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChartMessage />
        )}
      </ChartCard>

      <ChartCard title="แพ็กเกจต่อกลุ่ม">
        {charts.packagesByGroup.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts.packagesByGroup} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} width={32} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {charts.packagesByGroup.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChartMessage />
        )}
      </ChartCard>

      <ChartCard title="ไอเทมที่เพิ่มใหม่ (6 เดือนล่าสุด)">
        {charts.itemsByMonth.some((point) => point.count > 0) ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={charts.itemsByMonth} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} width={32} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg border border-brand-blush/50 bg-white px-3 py-2 text-sm shadow-sm">
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-muted-foreground">
                        {Number(payload[0].value).toLocaleString("th-TH")} รายการ
                      </p>
                    </div>
                  ) : null
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#d692a4"
                strokeWidth={2}
                dot={{ r: 4, fill: "#d692a4" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChartMessage />
        )}
      </ChartCard>
    </div>
  );
}
