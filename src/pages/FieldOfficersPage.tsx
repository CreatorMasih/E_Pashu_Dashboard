import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, CheckCircle2, Clock } from "lucide-react";
import { listFieldOfficerTasks, toggleFieldOfficerTask } from "@/lib/dataService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

const FieldOfficersPage = () => {
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["field-officer-tasks"],
    queryFn: listFieldOfficerTasks,
  });
  const completed = tasks.filter((t) => t.completed).length;

  const toggleMutation = useMutation({
    mutationFn: toggleFieldOfficerTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["field-officer-tasks"] });
      toast({ title: "Task updated", description: "Task status changed." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update task", description: error.message, variant: "destructive" });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Field Officer Panel</h2>
          <p className="text-muted-foreground text-sm">Today's assignments and progress</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div><div className="text-xl font-bold">3</div><p className="text-xs text-muted-foreground">Assigned Villages</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-status-due" />
              <div><div className="text-xl font-bold">{tasks.length - completed}</div><p className="text-xs text-muted-foreground">Pending Tasks</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-status-healthy" />
              <div><div className="text-xl font-bold">{completed}/{tasks.length}</div><p className="text-xs text-muted-foreground">Completed Today</p></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Today's Tasks</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading && <p className="text-sm text-muted-foreground">Loading tasks...</p>}
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Checkbox checked={t.completed} onCheckedChange={() => toggleMutation.mutate(t.id)} disabled={toggleMutation.isPending} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.task}</p>
                    <p className="text-xs text-muted-foreground">{t.village}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FieldOfficersPage;
