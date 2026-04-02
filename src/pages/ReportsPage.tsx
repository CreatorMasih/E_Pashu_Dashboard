import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { listVillageInsights } from "@/lib/dataService";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const ReportsPage = () => {
  const { data: insights = [], isLoading, isError, error } = useQuery({
    queryKey: ["village-insights"],
    queryFn: listVillageInsights,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Village Analytics</h2>
          <p className="text-muted-foreground text-sm">Village-wise livestock health, vaccination, and pregnancy insights</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Vaccination Coverage by Village</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={insights}>
                <XAxis dataKey="village" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="vaccinationCoverage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Village Health Table</CardTitle></CardHeader>
          <CardContent>
            {isError && (
              <p className="mb-4 text-sm text-destructive">
                Failed to load village analytics: {error instanceof Error ? error.message : "Unknown error"}
              </p>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Village</TableHead>
                  <TableHead>Total Animals</TableHead>
                  <TableHead>Critical</TableHead>
                  <TableHead>Pending Vaccinations</TableHead>
                  <TableHead>Pregnant Animals</TableHead>
                  <TableHead>Coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">Loading village insights...</TableCell>
                  </TableRow>
                )}
                {insights.map((row) => (
                  <TableRow key={row.village}>
                    <TableCell className="font-medium">{row.village}</TableCell>
                    <TableCell>{row.totalAnimals}</TableCell>
                    <TableCell>{row.criticalAnimals}</TableCell>
                    <TableCell>{row.pendingVaccinations}</TableCell>
                    <TableCell>{row.pregnantAnimals}</TableCell>
                    <TableCell>{row.vaccinationCoverage}%</TableCell>
                  </TableRow>
                ))}
                {!isLoading && !isError && insights.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No village analytics found. Check Farmers, Animals, Vaccinations, and Pregnancy sheet data.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
