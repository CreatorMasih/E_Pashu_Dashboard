import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReminder, listAlerts, listReminders, sendReminder } from "@/lib/dataService";
import { toast } from "@/components/ui/use-toast";
import type { ReminderItem } from "@/lib/types";
import { formatDisplayDate } from "@/lib/date";

const AIInsightsPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    village: "",
    recipient: "",
    channel: "SMS" as ReminderItem["channel"],
    message: "",
    dueDate: "",
  });

  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: listAlerts });
  const { data: reminders = [], isLoading } = useQuery({ queryKey: ["reminders"], queryFn: listReminders });

  const createMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setForm({ village: "", recipient: "", channel: "SMS", message: "", dueDate: "" });
      toast({ title: "Reminder created" });
    },
    onError: (error: Error) => {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: sendReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({ title: "Reminder sent" });
    },
  });

  const onCreate = () => {
    if (!form.recipient || !form.message) {
      toast({ title: "Missing fields", description: "Recipient and message are required", variant: "destructive" });
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Reminders & Notifications</h2>
          <p className="text-muted-foreground text-sm">Outbreak insights and notification workflow</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Auto Disease Signals</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {alerts.filter((a) => a.type === "AI Alert").slice(0, 5).map((item) => (
              <div key={item.id} className="text-sm p-2 rounded bg-muted/50">{item.message}</div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Create Reminder</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div><Label>Village</Label><Input value={form.village} onChange={(e) => setForm((p) => ({ ...p, village: e.target.value }))} /></div>
            <div><Label>Recipient</Label><Input value={form.recipient} onChange={(e) => setForm((p) => ({ ...p, recipient: e.target.value }))} /></div>
            <div>
              <Label>Channel</Label>
              <Select value={form.channel} onValueChange={(v) => setForm((p) => ({ ...p, channel: v as ReminderItem["channel"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Call">Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} /></div>
            <div className="sm:self-end"><Button className="w-full" onClick={onCreate} disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Create"}</Button></div>
            <div className="sm:col-span-5"><Label>Message</Label><Input value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Reminder Queue</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Loading reminders...</TableCell></TableRow>
                )}
                {reminders.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.recipient}</TableCell>
                    <TableCell>{item.village}</TableCell>
                    <TableCell>{item.channel}</TableCell>
                    <TableCell>{formatDisplayDate(item.dueDate)}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>
                      {item.status !== "Sent" && !item.id.startsWith("AUTO-") && (
                        <Button size="sm" variant="outline" onClick={() => sendMutation.mutate(item.id)} disabled={sendMutation.isPending}>Send</Button>
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

export default AIInsightsPage;
