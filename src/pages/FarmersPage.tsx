import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Phone } from "lucide-react";
import { createFarmer, listFarmers } from "@/lib/dataService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Farmer } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

const FarmersPage = () => {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<Farmer>({ name: "", phone: "", village: "", animals: 0 });
  const queryClient = useQueryClient();

  const { data: farmers = [], isLoading } = useQuery({
    queryKey: ["farmers"],
    queryFn: listFarmers,
  });

  const createMutation = useMutation({
    mutationFn: createFarmer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
      setIsDialogOpen(false);
      setForm({ name: "", phone: "", village: "", animals: 0 });
      toast({ title: "Farmer registered", description: "Farmer added successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to register farmer", description: error.message, variant: "destructive" });
    },
  });

  const filtered = farmers.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.village.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateFarmer = () => {
    if (!form.name || !form.phone || !form.village) {
      toast({ title: "Incomplete data", description: "Please fill all fields.", variant: "destructive" });
      return;
    }

    createMutation.mutate(form);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">Farmer Management</h2>
            <p className="text-muted-foreground text-sm">Manage registered farmers and their livestock</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Farmer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Register Farmer</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Name</Label><Input placeholder="Full name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input placeholder="+91..." value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} /></div>
                <div><Label>Village</Label><Input placeholder="Village name" value={form.village} onChange={(e) => setForm((prev) => ({ ...prev, village: e.target.value }))} /></div>
                <div><Label>No. of Animals</Label><Input type="number" placeholder="0" value={form.animals || ""} onChange={(e) => setForm((prev) => ({ ...prev, animals: Number(e.target.value) }))} /></div>
                <Button className="w-full" onClick={handleCreateFarmer} disabled={createMutation.isPending}>{createMutation.isPending ? "Registering..." : "Register Farmer"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-4">
            <div className="relative mb-4 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search farmers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Animals</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Loading farmers...</TableCell>
                  </TableRow>
                )}
                {filtered.map((f, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.phone}</TableCell>
                    <TableCell>{f.village}</TableCell>
                    <TableCell>{f.animals}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm"><Phone className="h-3.5 w-3.5 mr-1" /> Call</Button>
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

export default FarmersPage;
