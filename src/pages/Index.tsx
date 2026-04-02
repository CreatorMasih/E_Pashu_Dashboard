import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug as Cow, Users, Syringe, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  LineChart, Line, PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData, listAlerts, listAnimals, listFarmers, listVaccinations } from "@/lib/dataService";

const Dashboard = () => {
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });
  const { data: animals = [] } = useQuery({ queryKey: ["animals"], queryFn: listAnimals });
  const { data: farmers = [] } = useQuery({ queryKey: ["farmers"], queryFn: listFarmers });
  const { data: vaccinations = [] } = useQuery({ queryKey: ["vaccinations"], queryFn: listVaccinations });
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: listAlerts });

  const doneVaccinations = vaccinations.filter((item) => item.status === "Done").length;
  const coverage = vaccinations.length ? Math.round((doneVaccinations / vaccinations.length) * 100) : 0;
  const pendingVaccinations = vaccinations.filter((item) => item.status !== "Done").length;
  const highPriorityAlerts = alerts.filter((item) => item.priority === "High").length;

  const stats = [
    { label: "Total Animals", value: String(animals.length), icon: Cow, change: "Live count" },
    { label: "Total Farmers", value: String(farmers.length), icon: Users, change: "Live count" },
    { label: "Vaccination Coverage", value: `${coverage}%`, icon: ShieldCheck, change: `${doneVaccinations} completed` },
    { label: "Pending Vaccinations", value: String(pendingVaccinations), icon: Syringe, change: "Needs follow-up" },
    { label: "Active Alerts", value: String(alerts.length), icon: AlertTriangle, change: `${highPriorityAlerts} high priority` },
  ];

  if (isDashboardLoading) {
    return (
      <DashboardLayout>
        <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
      </DashboardLayout>
    );
  }

  if (isDashboardError || !dashboardData) {
    return (
      <DashboardLayout>
        <div className="space-y-2">
          <p className="text-sm font-medium text-destructive">Dashboard data load failed</p>
          <p className="text-sm text-muted-foreground">{dashboardError instanceof Error ? dashboardError.message : "Unknown error"}</p>
          <p className="text-xs text-muted-foreground">Check Apps Script deployment URL, sharing, and SPREADSHEET_ID script property.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground text-sm">Overview of livestock management activities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-xs font-medium">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vaccination Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dashboardData.vaccinationTrends}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="vaccinations" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Animal Health Status</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dashboardData.healthStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {dashboardData.healthStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dashboardData.monthlyActivity}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="registered" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vaccinated" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{a.action}</span>
                  <span className="text-muted-foreground"> — {a.detail}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
};

export default Dashboard;
