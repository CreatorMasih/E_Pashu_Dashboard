import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AlertTriangle, Bot, Bell, Syringe } from "lucide-react";
import { listAlerts } from "@/lib/dataService";
import { useQuery } from "@tanstack/react-query";

const iconMap: Record<string, React.ElementType> = {
  Vaccination: Syringe,
  "AI Alert": Bot,
  Health: AlertTriangle,
  Reminder: Bell,
  Breeding: Bell,
  System: Bell,
};

const AlertsPage = () => {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: listAlerts,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Alerts & Notifications</h2>
        <p className="text-muted-foreground text-sm">Monitor critical alerts and system notifications</p>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading alerts...</p>}
        {alerts.map((a) => {
          const Icon = iconMap[a.type] || Bell;
          return (
            <Card key={a.id}>
              <CardContent className="py-4 px-5 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{a.message}</p>
                  <p className="text-xs text-muted-foreground">{a.type} · {a.time}</p>
                </div>
                <StatusBadge status={a.priority} />
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;
