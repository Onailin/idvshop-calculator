"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
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
import { formatBahtInt } from "@/lib/utils";
import type { DashboardCharts, DashboardSalesMonthlyPoint } from "@/types";

type DashboardChartsProps = {
  charts: DashboardCharts;
};

type PieTooltipProps = {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: { fill?: string } }>;
};

const SALES_BAR = "#d692a4";
const SALES_BAR_SOFT = "#e6b8c4";
const SALES_LINE = "#9a6b7a";
const GRID_STROKE = "#e6d2d8";
const AXIS_TICK = "#7a5a64";

function ChartTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0];
  return (
    <div className="rounded-xl border border-brand-blush/60 bg-white/95 px-3 py-2 text-sm shadow-md backdrop-blur-sm">
      <p className="font-medium text-foreground">{entry.name}</p>
      <p className="text-muted-foreground">
        {entry.value?.toLocaleString("th-TH")} รายการ
      </p>
    </div>
  );
}

function EmptyChartMessage({ message = "ยังไม่มีข้อมูล" }: { message?: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ChartCard({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function TopSoldBarChart({
  title,
  description,
  data,
  emptyMessage,
  unitLabel,
}: {
  title: string;
  description: string;
  data: DashboardCharts["topSoldItems"];
  emptyMessage: string;
  unitLabel: string;
}) {
  const chartHeight = Math.max(220, data.length * 40);

  return (
    <ChartCard
      className="border-brand-blush/50 bg-gradient-to-br from-white via-white to-brand-cream/50"
      title={title}
      description={description}
    >
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 8, right: 20, top: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="4 8"
              horizontal={false}
              stroke={GRID_STROKE}
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 12, fill: AXIS_TICK }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 12, fill: AXIS_TICK }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(214, 146, 164, 0.08)" }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="rounded-xl border border-brand-blush/60 bg-white/95 px-3 py-2 text-sm shadow-md backdrop-blur-sm">
                    <p className="font-medium text-foreground">
                      {payload[0].payload?.name}
                    </p>
                    <p className="text-muted-foreground">
                      {Number(payload[0].value).toLocaleString("th-TH")} {unitLabel}
                    </p>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="value" radius={[0, 10, 10, 0]} maxBarSize={28}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill ?? SALES_BAR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChartMessage message={emptyMessage} />
      )}
    </ChartCard>
  );
}

function SalesChart({ data }: { data: DashboardSalesMonthlyPoint[] }) {
  const hasSales = data.some((point) => point.revenue > 0);
  const totalRevenue = data.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = data.reduce((sum, point) => sum + point.orderCount, 0);
  const peak = data.reduce(
    (best, point) => (point.revenue > best.revenue ? point : best),
    data[0] ?? { month: "-", revenue: 0, orderCount: 0 },
  );

  return (
    <ChartCard
      className="overflow-hidden border-brand-blush/50 bg-gradient-to-br from-white via-white to-brand-cream/80 lg:col-span-2"
      title="ยอดขายจากออเดอร์ที่เติมแล้ว"
      description="รวมยอดเงินออเดอร์สถานะเติมแล้ว 6 เดือนล่าสุด (ตามวันที่เติม)"
    >
      {hasSales ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-brand-blush/40 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">
                ยอดขาย 6 เดือน
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
                {formatBahtInt(totalRevenue)}
              </p>
            </div>
            <div className="rounded-2xl border border-brand-blush/40 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">
                จำนวนออเดอร์
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
                {totalOrders.toLocaleString("th-TH")}
              </p>
            </div>
            <div className="rounded-2xl border border-brand-blush/40 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">
                เดือนที่ยอดสูงสุด
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
                {peak.month}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBahtInt(peak.revenue)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-blush/30 bg-gradient-to-b from-brand-cream/40 to-transparent p-2 sm:p-3">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={data}
                margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="salesBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SALES_BAR} stopOpacity={1} />
                    <stop
                      offset="100%"
                      stopColor={SALES_BAR_SOFT}
                      stopOpacity={0.85}
                    />
                  </linearGradient>
                  <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SALES_BAR} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={SALES_BAR} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 8"
                  vertical={false}
                  stroke={GRID_STROKE}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: AXIS_TICK }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="revenue"
                  width={72}
                  tick={{ fontSize: 12, fill: AXIS_TICK }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) =>
                    value >= 1000
                      ? `${(value / 1000).toLocaleString("th-TH")}k`
                      : value.toLocaleString("th-TH")
                  }
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  width={36}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: AXIS_TICK }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(214, 146, 164, 0.08)" }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="min-w-[160px] rounded-xl border border-brand-blush/60 bg-white/95 px-3.5 py-2.5 text-sm shadow-lg backdrop-blur-sm">
                        <p className="font-semibold text-foreground">{label}</p>
                        <div className="mt-2 space-y-1">
                          <p className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">ยอดขาย</span>
                            <span className="font-medium text-primary">
                              {formatBahtInt(
                                Number(
                                  payload.find((entry) => entry.dataKey === "revenue")
                                    ?.value ?? 0,
                                ),
                              )}
                            </span>
                          </p>
                          <p className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">ออเดอร์</span>
                            <span className="font-medium">
                              {Number(
                                payload.find((entry) => entry.dataKey === "orderCount")
                                  ?.value ??
                                  payload[0]?.payload?.orderCount ??
                                  0,
                              ).toLocaleString("th-TH")}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : null
                  }
                />
                <Legend
                  verticalAlign="top"
                  height={28}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: AXIS_TICK }}
                />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  fill="url(#salesAreaGradient)"
                  stroke="none"
                  legendType="none"
                  tooltipType="none"
                />
                <Bar
                  yAxisId="revenue"
                  dataKey="revenue"
                  name="ยอดขาย"
                  fill="url(#salesBarGradient)"
                  radius={[10, 10, 4, 4]}
                  maxBarSize={48}
                />
                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orderCount"
                  name="จำนวนออเดอร์"
                  stroke={SALES_LINE}
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    fill: "#fff",
                    stroke: SALES_LINE,
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6, fill: SALES_LINE }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <EmptyChartMessage />
      )}
    </ChartCard>
  );
}

export function DashboardCharts({ charts }: DashboardChartsProps) {
  const categoryChartHeight = Math.max(220, charts.itemsByCategory.length * 36);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SalesChart data={charts.salesByMonth} />

      <TopSoldBarChart
        title="ไอเทม / สกินที่ลูกค้าซื้อเยอะสุด"
        description="จากออเดอร์ที่เติมแล้ว Top 8 ตามจำนวนชิ้น"
        data={charts.topSoldItems}
        emptyMessage="ยังไม่มีข้อมูลไอเทมจากออเดอร์ที่เติมแล้ว (ออเดอร์เก่าที่สั่งก่อนระบบบันทึกไอเทมจะไม่แสดงที่นี่)"
        unitLabel="ชิ้น"
      />

      <TopSoldBarChart
        title="แพ็กเกจที่ลูกค้าซื้อเยอะสุด"
        description="จากออเดอร์ที่เติมแล้ว Top 8 ตามจำนวนแพ็ก"
        data={charts.topSoldPackages}
        emptyMessage="ยังไม่มีข้อมูลแพ็กเกจจากออเดอร์ที่เติมแล้ว"
        unitLabel="แพ็ก"
      />

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
            <BarChart
              data={charts.itemsByRarity}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
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
            <BarChart
              data={charts.packagesByGroup}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
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
            <LineChart
              data={charts.itemsByMonth}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
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
