"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

// Mock data for PD Hours Progress
const pdHoursData = [
  { month: "Jan", hours: 2 },
  { month: "Feb", hours: 5 },
  { month: "Mar", hours: 8 },
  { month: "Apr", hours: 12 },
  { month: "May", hours: 15 },
  { month: "Jun", hours: 18 },
  { month: "Jul", hours: 22 },
  { month: "Aug", hours: 26 },
  { month: "Sep", hours: 30 },
  { month: "Oct", hours: 34 },
  { month: "Nov", hours: 38 },
  { month: "Dec", hours: 42 },
];

// Mock data for Performance Score Growth
const performanceData = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 68 },
  { month: "Mar", score: 72 },
  { month: "Apr", score: 70 },
  { month: "May", score: 75 },
  { month: "Jun", score: 78 },
  { month: "Jul", score: 80 },
  { month: "Aug", score: 82 },
  { month: "Sep", score: 85 },
  { month: "Oct", score: 84 },
  { month: "Nov", score: 87 },
  { month: "Dec", score: 90 },
];

// Mock data for Competency Graph
const competencyData = [
  { competency: "Communication", score: 85 },
  { competency: "Subject Knowledge", score: 92 },
  { competency: "Classroom Management", score: 78 },
  { competency: "Assessment", score: 88 },
  { competency: "Tech Integration", score: 80 },
];

const pdHoursConfig = {
  hours: {
    label: "PD Hours",
    color: "#f97316", // Blue color
  },
} satisfies ChartConfig;

const performanceConfig = {
  score: {
    label: "Performance Score",
    color: "#f97316", // Orange color
  },
} satisfies ChartConfig;

const competencyConfig = {
  score: {
    label: "Score",
    color: "#6366f1", // Indigo or your preferred color
  },
} satisfies ChartConfig;

const PerformanceCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* PD Hours Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>PD Assessment Hours</CardTitle>
          <CardDescription>
            Total professional development hours completed over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pdHoursConfig} className="h-[300px] w-full">
            <AreaChart data={pdHoursData}>
              <defs>
                <linearGradient id="fillHours" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-hours)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-hours)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}h`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) => `${value}`}
                  />
                }
              />
              <Area
                dataKey="hours"
                type="monotone"
                fill="url(#fillHours)"
                stroke="var(--color-hours)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Performance Score Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Score Growth</CardTitle>
          <CardDescription>
            Your performance score trend over the past year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={performanceConfig}
            className="h-[300px] w-full"
          >
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-score)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-score)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) => `${value}`}
                  />
                }
              />
              <Area
                dataKey="score"
                type="monotone"
                fill="url(#fillScore)"
                stroke="var(--color-score)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Competency Graph Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Competency Graph</CardTitle>
          <CardDescription>
            Your competency scores across key teaching skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={competencyConfig}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competencyData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="competency"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(249, 115, 22, 0.08)" }} // Changed to orange
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(value) => `${value}`}
                    />
                  }
                />
                <Bar dataKey="score" fill="#f97316" radius={[6, 6, 0, 0]} />{" "}
                {/* Changed to orange */}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceCards;
