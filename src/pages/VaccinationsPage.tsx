import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle } from "lucide-react";
import { listVaccinations, markVaccinationDone } from "@/lib/dataService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

const VaccinationsPage = () => {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["vaccinations"],
    queryFn: listVaccinations,
  });

  const markDoneMutation = useMutation({
    mutationFn: ({ animalId, type }: { animalId: string; type: string }) => markVaccinationDone(animalId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Vaccination updated", description: "Record marked as done." });
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
                    <TableCell>{v.date}</TableCell>
                    <TableCell><StatusBadge status={v.status} /></TableCell>
                    <TableCell>
                      {v.status !== "Done" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markDoneMutation.mutate({ animalId: v.animalId, type: v.type })}
                          disabled={markDoneMutation.isPending}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Done
                        </Button>
                      )}
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
