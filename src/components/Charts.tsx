"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Mock data for the Bar Chart
const enrollmentData = [
  { name: "May", interns: 4 },
  { name: "June", interns: 3 },
  { name: "July", interns: 7 },
  { name: "Aug", interns: 5 },
  { name: "Sep", interns: 8 },
];

// Mock data for the Pie Chart
const domainData = [
  { name: "Engineering", value: 12 },
  { name: "Design", value: 5 },
  { name: "Marketing", value: 4 },
  { name: "Product", value: 4 },
];

const COLORS = ["#4338CA", "#7C3AED", "#10b981", "#f59e0b"];

// --- Bar Chart Component ---
export const BarChartComponent = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={enrollmentData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Bar
          dataKey="interns"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- Pie Chart Component ---
export const PieChartComponent = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={domainData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {domainData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Legend iconSize={10} />
      </PieChart>
    </ResponsiveContainer>
  );
};
