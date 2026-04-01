import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createAnimal, listAnimals } from "@/lib/dataService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Animal, HealthStatus } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

const AnimalsPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<Animal>({ id: "", breed: "", age: 0, owner: "", status: "Healthy" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: animals = [], isLoading, isError, error } = useQuery({
    queryKey: ["animals"],
    queryFn: listAnimals,
  });

  const createMutation = useMutation({
    mutationFn: createAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      setIsDialogOpen(false);
      setForm({ id: "", breed: "", age: 0, owner: "", status: "Healthy" });
      toast({ title: "Animal registered", description: "New animal added successfully." });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to register animal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filtered = animals.filter((a) => {
    const id = String(a.id || "").toLowerCase();
    const breed = String(a.breed || "").toLowerCase();
    const owner = String(a.owner || "").toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = id.includes(query) || breed.includes(query) || owner.includes(query);
    const matchesFilter = filter === "all" || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateAnimal = () => {
    if (!form.id || !form.breed || !form.owner || form.age <= 0) {
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
            <h2 className="text-2xl font-bold">Animal Management</h2>
            <p className="text-muted-foreground text-sm">Track and manage all registered animals</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Animal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Register New Animal</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Animal ID</Label><Input placeholder="ANM-XXX" value={form.id} onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))} /></div>
                  <div><Label>Breed</Label><Input placeholder="e.g. Holstein" value={form.breed} onChange={(e) => setForm((prev) => ({ ...prev, breed: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Age (years)</Label><Input type="number" placeholder="0" value={form.age || ""} onChange={(e) => setForm((prev) => ({ ...prev, age: Number(e.target.value) }))} /></div>
                  <div><Label>Owner</Label><Input placeholder="Farmer name" value={form.owner} onChange={(e) => setForm((prev) => ({ ...prev, owner: e.target.value }))} /></div>
                </div>
                <div><Label>Health Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as HealthStatus }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Healthy">Healthy</SelectItem>
                      <SelectItem value="Due">Due</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreateAnimal} disabled={createMutation.isPending}>{createMutation.isPending ? "Registering..." : "Register Animal"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-4">
            {isError && (
              <p className="mb-4 text-sm text-destructive">
                Failed to load animals: {error instanceof Error ? error.message : "Unknown error"}
              </p>
            )}
            <div className="flex gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search animals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Healthy">Healthy</SelectItem>
                  <SelectItem value="Due">Due</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal ID</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Loading animals...</TableCell>
                  </TableRow>
                )}
                {filtered.map((a) => (
                  <TableRow key={a.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/animals/${a.id}`)}>
                    <TableCell className="font-medium">{a.id}</TableCell>
                    <TableCell>{a.breed}</TableCell>
                    <TableCell>{a.age} yrs</TableCell>
                    <TableCell>{a.owner}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
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

export default AnimalsPage;
