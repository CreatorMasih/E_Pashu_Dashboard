import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { listVaccinations, updateVaccinationStatus } from "@/lib/dataService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { formatDisplayDate } from "@/lib/date";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { VaccinationStatus } from "@/lib/types";

const VaccinationsPage = () => {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["vaccinations"],
    queryFn: listVaccinations,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ animalId, type, status }: { animalId: string; type: string; status: VaccinationStatus }) =>
      updateVaccinationStatus(animalId, type, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Vaccination updated", description: "Vaccination status changed successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Health & Vaccination Tracker</h2>
          <p className="text-muted-foreground text-sm">Track vaccination status and schedules</p>
        </div>

        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal ID</TableHead>
                  <TableHead>Vaccine Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Loading vaccinations...</TableCell>
                  </TableRow>
                )}
                {data.map((v, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{v.animalId}</TableCell>
                    <TableCell>{v.type}</TableCell>
                    <TableCell>{formatDisplayDate(v.date)}</TableCell>
                    <TableCell><StatusBadge status={v.status} /></TableCell>
                    <TableCell>
                      <Select
                        value={v.status}
                        onValueChange={(next) =>
                          updateStatusMutation.mutate({
                            animalId: v.animalId,
                            type: v.type,
                            status: next as VaccinationStatus,
                          })
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Overdue">Overdue</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
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

export default VaccinationsPage;
