import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listVillageInsights } from "@/lib/dataService";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "@/components/ui/use-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDisplayDate } from "@/lib/date";

const ReportsPage = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: insights = [], isLoading, isError, error } = useQuery({
    queryKey: ["village-insights", fromDate, toDate],
    queryFn: () => listVillageInsights({ fromDate, toDate }),
  });

  const getReportFilename = (ext: "csv" | "pdf") => {
    const date = new Date().toISOString().slice(0, 10);
    const range = fromDate || toDate ? `-${fromDate || "start"}-to-${toDate || "today"}` : "";
    return `village-analytics${range}-${date}.${ext}`;
  };

  const downloadCsv = () => {
    if (!insights.length) {
      toast({ title: "No data to export", description: "Village analytics data is empty.", variant: "destructive" });
      return;
    }

    const headers = [
      "Village",
      "Total Animals",
      "Critical",
      "Pending Vaccinations",
      "Pregnant Animals",
      "Coverage (%)",
    ];

    const rows = insights.map((row) => [
      row.village,
      row.totalAnimals,
      row.criticalAnimals,
      row.pendingVaccinations,
      row.pregnantAnimals,
      row.vaccinationCoverage,
    ]);

    const csvContent = [headers, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getReportFilename("csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    if (!insights.length) {
      toast({ title: "No data to export", description: "Village analytics data is empty.", variant: "destructive" });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Village Analytics Report", 14, 14);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 20);
    doc.text(`Date range: ${fromDate ? formatDisplayDate(fromDate, "All") : "All"} to ${toDate ? formatDisplayDate(toDate, "All") : "All"}`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [["Village", "Total Animals", "Critical", "Pending Vaccinations", "Pregnant Animals", "Coverage (%)"]],
      body: insights.map((row) => [
        row.village,
        String(row.totalAnimals),
        String(row.criticalAnimals),
        String(row.pendingVaccinations),
        String(row.pregnantAnimals),
        `${row.vaccinationCoverage}%`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [28, 98, 211] },
    });

    doc.save(getReportFilename("pdf"));
  };

  const totalAnimals = insights.reduce((sum, row) => sum + row.totalAnimals, 0);
  const totalPregnant = insights.reduce((sum, row) => sum + row.pregnantAnimals, 0);
  const totalPendingVaccinations = insights.reduce((sum, row) => sum + row.pendingVaccinations, 0);
  const avgCoverage = insights.length
    ? Math.round(insights.reduce((sum, row) => sum + row.vaccinationCoverage, 0) / insights.length)
    : 0;
  const topRiskVillage = insights
    .slice()
    .sort((a, b) => b.criticalAnimals + b.pendingVaccinations - (a.criticalAnimals + a.pendingVaccinations))[0]?.village;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold">Village Analytics</h2>
            <p className="text-muted-foreground text-sm">Village-wise livestock health, vaccination, and pregnancy insights</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[160px]"
              aria-label="From date"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-[160px]"
              aria-label="To date"
            />
            <Button
              variant="ghost"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              disabled={isLoading || (!fromDate && !toDate)}
            >
              Clear
            </Button>
            <Button variant="outline" onClick={downloadCsv} disabled={isLoading || !insights.length}>
              <Download className="h-4 w-4 mr-2" /> Download CSV
            </Button>
            <Button onClick={downloadPdf} disabled={isLoading || !insights.length}>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Animals</p><p className="text-2xl font-bold">{totalAnimals}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Pregnant</p><p className="text-2xl font-bold">{totalPregnant}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Pending Vaccinations</p><p className="text-2xl font-bold">{totalPendingVaccinations}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Average Coverage</p><p className="text-2xl font-bold">{avgCoverage}%</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Top Risk Village</p><p className="text-lg font-semibold truncate">{topRiskVillage || "-"}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-1">
            <CardHeader><CardTitle className="text-sm font-medium">Vaccination Coverage by Village</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={insights}>
                  <XAxis dataKey="village" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="vaccinationCoverage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="xl:col-span-1">
            <CardHeader><CardTitle className="text-sm font-medium">Health Risk by Village</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={insights}>
                  <XAxis dataKey="village" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="criticalAnimals" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pendingVaccinations" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="xl:col-span-1">
            <CardHeader><CardTitle className="text-sm font-medium">Pregnancy and Animal Load</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={insights}>
                  <XAxis dataKey="village" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Line type="monotone" dataKey="pregnantAnimals" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="totalAnimals" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

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
