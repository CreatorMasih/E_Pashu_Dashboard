import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { createPregnancyRecord, listPregnancyRecords, updatePregnancyStatus } from "@/lib/dataService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import type { PregnancyRecord } from "@/lib/types";
import { formatDisplayDate } from "@/lib/date";

const BreedingPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Omit<PregnancyRecord, "id">>({
    animalId: "",
    village: "",
    inseminationDate: "",
    expectedCalving: "",
    status: "Inseminated",
    lastCheckDate: "",
    notes: "",
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["pregnancy-records"],
    queryFn: listPregnancyRecords,
  });

  const createMutation = useMutation({
    mutationFn: createPregnancyRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pregnancy-records"] });
      setForm({
        animalId: "",
        village: "",
        inseminationDate: "",
        expectedCalving: "",
        status: "Inseminated",
        lastCheckDate: "",
        notes: "",
      });
      toast({ title: "Pregnancy record added" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PregnancyRecord["status"] }) => updatePregnancyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pregnancy-records"] });
    },
  });

  const pregnantCount = records.filter((item) => item.status === "Pregnant" || item.status === "Due Soon").length;
  const deliveredCount = records.filter((item) => item.status === "Delivered").length;

  const onCreate = () => {
    if (!form.animalId || !form.village || !form.inseminationDate || !form.expectedCalving) {
      toast({ title: "Missing fields", description: "Fill required fields", variant: "destructive" });
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Pregnancy Tracking</h2>
          <p className="text-muted-foreground text-sm">Track insemination, pregnancy checks, and delivery outcomes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Total Records</p><p className="text-2xl font-bold">{records.length}</p></CardContent></Card>
          <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Active Pregnancy</p><p className="text-2xl font-bold">{pregnantCount}</p></CardContent></Card>
          <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Delivered</p><p className="text-2xl font-bold">{deliveredCount}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Add Pregnancy Record</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div><Label>Animal ID</Label><Input value={form.animalId} onChange={(e) => setForm((p) => ({ ...p, animalId: e.target.value }))} /></div>
              <div><Label>Village</Label><Input value={form.village} onChange={(e) => setForm((p) => ({ ...p, village: e.target.value }))} /></div>
              <div><Label>Insemination Date</Label><Input type="date" value={form.inseminationDate} onChange={(e) => setForm((p) => ({ ...p, inseminationDate: e.target.value }))} /></div>
              <div><Label>Expected Calving</Label><Input type="date" value={form.expectedCalving} onChange={(e) => setForm((p) => ({ ...p, expectedCalving: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as PregnancyRecord["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inseminated">Inseminated</SelectItem>
                    <SelectItem value="Pregnant">Pregnant</SelectItem>
                    <SelectItem value="Due Soon">Due Soon</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Last Check</Label><Input type="date" value={form.lastCheckDate} onChange={(e) => setForm((p) => ({ ...p, lastCheckDate: e.target.value }))} /></div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <Button onClick={onCreate} disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Add Record"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal ID</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Expected Calving</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Loading pregnancy records...</TableCell>
                  </TableRow>
                )}
                {records.map((b) => (
                  <TableRow key={b.id} className={cn(b.status === "Due Soon" && "bg-amber-50 dark:bg-amber-950/20")}>
                    <TableCell className="font-medium">{b.animalId}</TableCell>
                    <TableCell>{b.village}</TableCell>
                    <TableCell>{formatDisplayDate(b.expectedCalving)}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                    <TableCell>
                      <Select value={b.status} onValueChange={(v) => statusMutation.mutate({ id: b.id, status: v as PregnancyRecord["status"] })}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inseminated">Inseminated</SelectItem>
                          <SelectItem value="Pregnant">Pregnant</SelectItem>
                          <SelectItem value="Due Soon">Due Soon</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BreedingPage;
